// I:图片素材组件
// 1:难度选择卡片的组件
//Vue.use(gp_store);
Vue.component('diff-card-img', {
	props:['y','x','diff','message'],
	data: function(){
		return {
			spansize:spansize,
			picurl:'./res/img/hazard2.jpg'
		}
	},
	computed:{
		getTop: function(){
			return ''+(-pic_top_margin-card_height*this.y)+'px';
		},
		getLeft: function(){
			return ''+(-pic_left_margin-card_width*this.x)+'px';
		}
	},
	methods:{
		diffChoose:function(){
			if(gp_store.state.debug)console.log('选择了难度:'+this.diff);
			gp_store.commit('setRound',3);
			gp_store.commit('setDiff',params_diff[this.diff]);
			doWhenChoosedDiff(gp_store.state.running_diff);
		}
	},
	template:	'<span :title="message" :style="spansize" @click="diffChoose"><img :src="picurl" :style="{position:\'relative\', top:getTop, left:getLeft}"/></span>'
});

// 2:战斗卡片的组件-其中知识卡将被默认旋转-点击可加外框及添加special技能-年龄卡自动执行特技
Vue.component('robinson-card-img', {
	props:['card'],
	data: function(){
		return {
			spansize:spansize,
			borderstyle:default_card_board,
			innerY:this.card.getY(),
			innerX:this.card.getX()
		}
	},
	watch:{
		card : function(){
			// 监听更新内部值
			this.innerY = this.card.getY();
			this.innerX = this.card.getX();
			if(specialDeck.contain(this.card))this.borderstyle = select_card_board;
			else this.borderstyle = default_card_board;
			// 若该衰老卡被技能替换出来，也会发动特效。
			if(this.card instanceof AgeCard && this.card.getCardSpecial()!='None'){
				if(gp_store.state.debug)console.log('年龄卡['+this.card.getName()+']被换取,特技触发:'+this.card.getCardSpecial());
				doSpecial('cast',this.card);
				this.borderstyle=select_card_board; // 年龄卡默认加外框
			}
		}
	},
	created: function () {
		// 年龄卡的特效必须执行，且不加入specialDeck中
		if(this.card instanceof AgeCard && this.card.getCardSpecial()!='None'){
			if(gp_store.state.debug)console.log('年龄卡['+this.card.getName()+']特技触发:'+this.card.getCardSpecial());
			doSpecial('cast',this.card);
			this.borderstyle=select_card_board; // 年龄卡默认加外框
		}
	},
	computed:{
		getTop: function(){
			return ''+(-pic_top_margin-card_height*this.innerY)+'px';
		},
		getLeft: function(){
			return ''+(-pic_left_margin-card_width*this.innerX)+'px';
		},
		dotransform: function(){
			if(this.card instanceof HazardCard){
				this.innerY = 2 - this.innerY;
				this.innerX = 5 - this.innerX;
				return 'scale(-1,-1)';
			}
			else return 'scale(1,1)';
		}
	},
	methods:{
		pickCard:function(){
			if(gp_store.state.debug)console.log('选择了卡牌:'+this.card.getName()+"("+this.card.getX()+","+this.card.getY()+")");
			if(!(this.card instanceof AgeCard) && this.card.getCardSpecial()!='None'){
				// 非年龄卡且有特殊能力的robinson卡可以选择是否使用特技
				if(gp_store.state.debug)console.log('特殊能力:'+this.card.getCardSpecial());
				if(this.borderstyle==default_card_board){
					// 选中卡牌
					if(gp_store.state.special!=undefined){
						warn_yellow('操作错误','每次只能选择一张卡牌释放特技!');
					} else {
						gp_store.commit('setSpecial',this.card); // 添加选定的特技待释放牌
						this.borderstyle=select_card_board; // 添加外框
						doSpecial('add',this.card);
					}
				} else {
					// 取消选中卡牌(仅可取消未使用过技能的卡牌，即gp_store.state.special)
					if(gp_store.state.special != this.card){
						warn_yellow('操作错误','不能取消已使用特技的卡牌!');
					} else {
						gp_store.commit('setSpecial',undefined); // 清空特技待释放牌
						this.borderstyle=default_card_board; // 移除外框
						doSpecial('remove',this.card);
					}
				}
			}
		}
	},
	template:	'<span :title="card.getName()" :style="[spansize, borderstyle]" @click="pickCard"><img :src="card.getUrl()" :style="{transform:dotransform,position:\'relative\', top:getTop, left:getLeft}"/></span>'
});

// 3:被废弃/移除的卡牌-其中HazardCard点击可旋转
Vue.component('junk-card-img', {
	props:['card'],
	data: function(){
		return {
			spansize:spansize,
			trans:false,
			innerY:this.card.getY(),
			innerX:this.card.getX()
		}
	},
	watch:{
		card : function(){// 监听card更新内部值
			this.innerY = this.card.getY();
			this.innerX = this.card.getX();
			this.tarns = false;
		}
	},
	computed:{
		getTop: function(){
			return ''+(-pic_top_margin-card_height*this.innerY)+'px';
		},
		getLeft: function(){
			return ''+(-pic_left_margin-card_width*this.innerX)+'px';
		},
		dotransform: function(){
			return this.trans?'scale(-1,-1)':'scale(1,1)';
		}
	},
	methods:{
		pickCard:function(){
			if(gp_store.state.debug)console.log('选择了卡牌:'+this.card.getName());
		},
		switchtransform:function(){
			if(!(this.card instanceof HazardCard))return;
			this.innerY = 2 - this.innerY;
			this.innerX = 5 - this.innerX;
			if(this.trans)this.trans=false;
			else this.trans=true;
		}
	},
	template:	'<span :title="card.getName()" :style="spansize" @click="pickCard"><img :src="card.getUrl()" :style="{transform:dotransform,position:\'relative\', top:getTop, left:getLeft}" @click="switchtransform"/></span>'
});

// 4:*灾难/海盗卡片的组件-没有旋转的选项-有且只有一张Hazard Card全局变量
Vue.component('hazard-card-img', {
	data: function(){
		return {
			spansize:spansize,
		}
	},
	computed:{
		card : () => gp_store.state.hazard,
		getTop: function(){
			return ''+(-pic_top_margin-card_height*this.card.getY())+'px';
		},
		getLeft: function(){
			return ''+(-pic_left_margin-card_width*this.card.getX())+'px';
		}
	},
	methods:{
		pickCard:function(){
			if(gp_store.state.debug)console.log('选择了卡牌:'+this.card.getName());
		}
	},
	template:	'<span :title="card.getName()" :style="spansize" @click="pickCard"><img :src="card.getUrl()" :style="{position:\'relative\', top:getTop, left:getLeft}"/></span>'
});

// 5:二选一灾难组件
Vue.component('choose-hazard-card-img', {
	props:['card'],
	data: function(){
		return {
			spansize:spansize
		}
	},
	computed:{
		getTop: function(){
			return ''+(-pic_top_margin-card_height*this.card.getY())+'px';
		},
		getLeft: function(){
			return ''+(-pic_left_margin-card_width*this.card.getX())+'px';
		}
	},
	methods:{
		pickCard:function(){
			if(this.card instanceof HazardCard){
				// 供选择的二选一灾难卡
				gp_store.commit('setHazard',this.card); // 选中的灾难卡
				selectShowDeck.removeCard(this.card); // 选中的卡片不丢入灾难弃牌堆
				selectShowDeck.moveTo(discardHazardDeck); // 模态框消失前，此处已清空
				hideBootstrapModal('#selectHazradModal'); // 模态框消失
			}
			if(gp_store.state.debug)console.log('选择了卡牌:'+this.card.getName());
		}
	},
	template:	'<span :title="card.getName()+\'-[\'+card.getCardSpecial()+\']\'" :style="spansize" @click="pickCard"><img :src="card.getUrl()" :style="{position:\'relative\', top:getTop, left:getLeft}"/></span>'
});

// 6:选择框内的简单图片显示组件
Vue.component('show-card-img', {
	props:['card'],
	data: function(){
		return {
			spansize:spansize
		}
	},
	computed:{
		getTop: function(){
			return ''+(-pic_top_margin-card_height*this.card.getY())+'px';
		},
		getLeft: function(){
			return ''+(-pic_left_margin-card_width*this.card.getX())+'px';
		}
	},
	methods:{
		pickCard:function(){
			if(gp_store.state.debug)console.log('选择了卡牌:'+this.card.getName());
		}
	},
	template:	'<span :title="card.getName()" :style="spansize" @click="pickCard"><img :src="card.getUrl()" :style="{position:\'relative\', top:getTop, left:getLeft}"/></span>'
});

// 7:选择框内的图片组件 - HazardCard 默认旋转
Vue.component('select-card-img', {
	props:['card'],
	data: function(){
		return {
			select_show_deck:selectShowDeck.getDeck(),
			spansize:spansize,
			borderstyle:default_card_board,
			innerY:this.card.getY(),
			innerX:this.card.getX()
		}
	},
	computed:{
		getTop: function(){
			return ''+(-pic_top_margin-card_height*this.innerY)+'px';
		},
		getLeft: function(){
			return ''+(-pic_left_margin-card_width*this.innerX)+'px';
		},
		dotransform: function(){
			if(this.card instanceof HazardCard){
				this.innerY = 2 - this.innerY;
				this.innerX = 5 - this.innerX;
				return 'scale(-1,-1)';
			}
			else return 'scale(1,1)';
		},
		lostlife: ()=> gp_store.state.lost_life,
		special : () => gp_store.state.special,
		copyspecial : () => gp_store.state.copyspecial
	},
	watch:{
		card : function(){
			this.innerY = this.card.getY();
			this.innerX = this.card.getX();
			this.borderstyle = default_card_board;
		}
	},
	methods:{
		pickCard:function(){
			if(this.borderstyle==default_card_board){
				let special =  this.special || this.copyspecial;
				// 损失的生命值(只在回合结束后有值)>技能卡
				let max_pick = this.lostlife || getSpecialTarget(special.getCardSpecial())-1;//-1 trick
				let already_pick = this.lostlife?specialTargetDeck.getDestoryValueSum():specialTargetDeck.size();
				let tobe_pick = this.lostlife?this.card.getDestoryValue():0;
				if(already_pick+tobe_pick<=max_pick){
					this.borderstyle=select_card_board; // 添加外框
					specialTargetDeck.addCard(this.card); // 加入技能目标对象卡堆
				} else {
					if(this.lostlife) warn_yellow('操作错误','您只能选择总值为'+max_pick+'的战斗卡!');
					else warn_yellow('操作错误','您只能选择'+(max_pick+1)+'张目标卡!'); // 上面-1了
				}
			} else {
				this.borderstyle=default_card_board; // 移除外框
				specialTargetDeck.removeCard(this.card);
			}
			if(gp_store.state.debug)console.log('选择了卡牌:'+this.card.getName());
		}
	},
	template:	'<span :title="card.getName()" :style="[spansize, borderstyle]" @click="pickCard"><img :src="card.getUrl()" :style="{transform:dotransform,position:\'relative\', top:getTop, left:getLeft}"/></span>'
});


// II:页面缩略组件
// 文本模态框
Vue.component('bootstrap-text-modal', {
	props:['modalid','modaltitle'],
	template:
	'<div class="modal fade" :id="modalid" tabindex="-1" role="dialog" aria-hidden="true">\
		<div class="modal-dialog">\
			<div class="modal-content">\
				<div class="modal-header">\
					<button type="button" class="close" data-dismiss="modal" aria-hidden="true">\
						&times;\
					</button>\
					<h4 class="modal-title" style="color:#4682B4;font-weight:bold">\
						{{modaltitle}}\
					</h4>\
				</div>\
				<div class="modal-body">\
					<slot name="body"></slot><!--插槽-->\
				</div>\
				<div class="modal-footer">\
					<button type="button" class="btn btn-primary" data-dismiss="modal">\
						阅读完毕\
					</button>\
				</div>\
			</div>\
		</div>\
	</div>'
});
// Special&灾难卡选择模态框
Vue.component('bootstrap-select-modal', {
	props:['modalid','modaltitle','canmiss','comfirmmsg'],
	computed:{
		special: () => gp_store.state.special,
		copyspecial:() => gp_store.state.copyspecial,
	},
	methods:{
		// 这两个功能在灾难卡二选一时不出现
		comfirm: function(){
			specialCarrier(this.special||this.copyspecial);
		},
		undo : function(){
			specialCancel(this.special||this.copyspecial);
		}
	},
	template:
	'<div class="modal fade" :id="modalid" tabindex="-1" role="dialog" aria-hidden="true" data-backdrop="static" data-keyboard="false">\
		<div class="modal-dialog">\
			<div class="modal-content">\
				<div class="modal-header">\
					<h4 class="modal-title" style="color:#4682B4;font-weight:bold">\
						{{modaltitle}}\
					</h4>\
				</div>\
				<div class="modal-body">\
					<slot name="body"></slot><!--插槽-->\
				</div>\
				<div class="modal-footer" v-show="canmiss==\'true\'">\
					<button type="button" class="btn btn-primary" @click="comfirm">\
						{{comfirmmsg}}\
					</button>\
					<button type="button" class="btn btn-danger" @click="undo" ><!--data-dismiss="modal"-->\
						终止\
					</button>\
				</div>\
			</div>\
		</div>\
	</div>'
});
// 选择要移除卡牌的选择模态框
Vue.component('bootstrap-destory-modal', {
	props:['modalid'],
	computed:{
		lostlife: ()=> gp_store.state.lost_life
	},
	methods:{
		comfirm: function(){
			destoryCard();
		}
	},
	template:
	'<div class="modal fade" :id="modalid" tabindex="-1" role="dialog" aria-hidden="true" data-backdrop="static" data-keyboard="false">\
		<div class="modal-dialog">\
			<div class="modal-content">\
				<div class="modal-header">\
					<h4 class="modal-title" style="color:#4682B4;font-weight:bold">\
						请选择要移除的卡牌:总和为{{lostlife}}。\
					</h4>\
				</div>\
				<div class="modal-body">\
					<slot name="body"></slot><!--插槽-->\
				</div>\
				<div class="modal-footer">\
					<button type="button" class="btn btn-primary" @click="comfirm">\
						确定\
					</button>\
				</div>\
			</div>\
		</div>\
	</div>'
});
// 带输入框的单img-input选择模态框
Vue.component('bootstrap-input-modal', {
	props:['modalid','modaltitle','comfirmmsg'],
	computed:{
		special : () => gp_store.state.special,
		copyspecial : () => gp_store.state.copyspecial
	},
	methods:{
		// 输入确认函数
		comfirm: function(){
			specialType(this.special || this.copyspecial);
		}
	},
	template:
	'<div class="modal fade" :id="modalid" tabindex="-1" role="dialog" aria-hidden="true" data-backdrop="static" data-keyboard="false">\
		<div class="modal-dialog">\
			<div class="modal-content">\
				<div class="modal-header">\
					<h4 class="modal-title" style="color:#4682B4;font-weight:bold">\
						{{modaltitle}}\
					</h4>\
				</div>\
				<div class="modal-body">\
					<slot name="body"></slot><!--插槽-->\
				</div>\
				<div class="modal-footer">\
					<button type="button" class="btn btn-primary" @click="comfirm">\
						{{comfirmmsg}}\
					</button>\
				</div>\
			</div>\
		</div>\
	</div>'
});
// 计分数据表
Vue.component('jifen-table', {
	template:
	'<table class="table table-striped">\
		<thead>\
			<tr>\
				<th>项目</th>\
				<th>积分规则</th>\
			</tr>\
		</thead>\
		<tbody>\
			<tr>\
				<td>战斗卡(含弃牌堆)</td>\
				<td>[战斗值]分/张</td>\
			</tr>\
			<tr>\
				<td>鲁滨逊牌堆中的衰老卡</br>(含弃牌堆)</td>\
				<td>-5分/张</td>\
			</tr>\
			<tr>\
				<td>击败的海盗卡</td>\
				<td>15分/张</td>\
			</tr>\
			<tr>\
				<td>剩余生命值</td>\
				<td>5分/点生命值</td>\
			</tr>\
			<tr>\
				<td>弃牌堆中未通过的灾难卡</td>\
				<td>-3分/张</td>\
			</tr>\
			<tr>\
				<td>难度修正系数加成</td>\
				<td>各个难度对最终分数的加成系数分别为:</br>x1.0/x1.2/x1.5/x2.0</td>\
			</tr>\
			<tr>\
				<td>硬核模式:技能损耗加成</td>\
				<td>其对最终分数的加成系数为:x(N+1.0)</td>\
			</tr>\
		</tbody>\
	</table>'
});
// 版本信息数据表
Vue.component('version-table', {
	computed:{
		version : () => gp_store.state.version
	},
	template:
	'<table class="table table-striped">\
		<thead>\
			<tr>\
				<th>项目</th>\
				<th>详细信息</th>\
			</tr>\
		</thead>\
		<tbody>\
			<tr>\
				<td>图片素材来源</td>\
				<td><a target="_blank" href="https://www.boardgamegeek.com/filepage/137658/friday-mini-card-unofficial-fan-made-version">BGG @Wendell Beitzel</a></td>\
			</tr>\
			<tr>\
				<td>中文说明书来源</td>\
				<td><a target="_blank" href="https://www.boardgamegeek.com/filepage/73003/simplified-chinese-rulebook">BGG @Lam Chungwah</a></td>\
			</tr>\
			<tr>\
				<td>BGG地址</td>\
				<td><a target="_blank" href="https://www.boardgamegeek.com/boardgame/43570/friday">Board Game:《Friday》</a></td>\
			</tr>\
			<tr>\
				<td>游戏版本号</td>\
				<td><a target="_blank" href="./res/versionInfo.html">Version:{{version}}</a><!--@pikaalulu--></td>\
			</tr>\
			<tr>\
				<td>作者</td>\
				<td><a target="_blank" href="https://blog.csdn.net/shenpibaipao">@身披白袍</a> <a href="#" onClick="alert(\'大佬不想说话\');">@CPHIOLYA</a> <a target="_blank" href="https://steamcommunity.com/id/aopika">@AOPika</a></td>\
			</tr>\
		</tbody>\
	</table>'
});
//新卡牌技能信息表
Vue.component('new-skill-table', {
	template:
	'<table class="table table-striped">\
		<thead>\
			<tr>\
				<th>项目</th>\
				<th>英文</th>\
				<th>详细信息</th>\
			</tr>\
		</thead>\
		<tbody>\
			<tr>\
				<td>吝啬鬼</td>\
				<td>No Free Card</td>\
				<td>鲁滨逊将没有免费战斗卡可以抽取。</td>\
			</tr>\
			<tr>\
				<td>毒药</td>\
				<td>Poison X</td>\
				<td>回合开始时，鲁滨逊将立即受到等同于X的毒素伤害。</br>该伤害不被记录用于移除卡牌的损失生命值中。</br>毒素伤害的结算优先于抽卡阶段。</td>\
			</tr>\
			<tr>\
				<td>荆棘伤害</td>\
				<td>Thorns</td>\
				<td>在结束战斗后，鲁滨逊将受到等同于当前已打出的战斗卡的数目的值的伤害。</br>该伤害不被记录用于移除卡牌的损失生命值中。</br>荆棘伤害的结算优先于战斗胜负结算。</td>\
			</tr>\
		</tbody>\
	</table>'
});