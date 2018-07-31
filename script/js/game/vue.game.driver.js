resetGame();// 开局直接重置参数
// gameProcessing() Begin: //

//--导航栏信息View--//
var navbarview = new Vue({
	el:'#navbarview',
	data:{
		cheat:false,
		audioPaused:false
	},
	computed:{
		getPhaseColor:function(){
			phase = gp_store.state.running_phase;
			if(phase==1)return 'green';
			else if(phase==2)return '#DAA520';
			else if(phase==3)return 'red';
			else if(phase==4)return '#FF6600';
			else return 'black';
		},
		getLifeColor:function(){
			if(gp_store.state.running_life>=15)return '#009966';
			else if(gp_store.state.running_life>=5 && this.running_life<15) return '#CC6600';
			else return '#FF6633'
		},
		getDiffColor:function(){
			diff = gp_store.state.running_diff;
			if(diff==params_diff.green)return 'green';
			else if(diff==params_diff.yellow)return '#DAA520';
			else if(diff==params_diff.red)return 'red';
			else return '#FF6600';
		},
		running_diff : () => gp_store.state.running_diff,
		running_life : () => gp_store.state.running_life,
		running_phase : () => gp_store.state.running_phase
	},
	methods:{
		cheatOn:function (){
			if(this.cheat) this.cheat = false;
			else this.cheat = true;
			gp_store.commit('debug_onoff');
			//Vue.config.silent = !this.cheat;
		},
		musicOn :function(){
			if(this.audioPaused)replayAudio();
			else pauseAudio();
			this.audioPaused = !this.audioPaused;
		},
		dec1Health:function(){
			warn_gray('作弊启动','减去1点生命值');
			gp_store.commit('incLife',-1);
		},
		addHealth:function(){
			warn_gray('作弊启动','添加20点生命值');
			gp_store.commit('incLife',20);
		},
		decPhase: function(){
			warn_gray('作弊启动','游戏阶段减1');
			gp_store.commit('incPhase',-1);
		},
		addPhase:function(){
			warn_gray('作弊启动','游戏阶段加1');
			gp_store.commit('incPhase',1);
		},
		add5Fight :function(){
			warn_gray('作弊启动','添加5点生命值');
			gp_store.commit('incFightAdjust',5);
		},
		log:printAllParams
	}
});

//--游戏设置界面View--//
var gamesetview = new Vue({
	el:'#gamesetview',
	data:{
		skill_loss_input:0,
		diff_tips:c_diffs,
	},
	watch:{
		skill_loss_input : function(){
			var reg = /^(0|[1-9][0-9]*)$/; // 自然数
			if(!reg.test(this.skill_loss_input))this.skill_loss_input=0;
			gp_store.commit('setSkillLoss',this.skill_loss_input);
		},
		skill_loss : function(){
			// 保证 vuex.skill_loss 和 输入框中的 v-modal=skill_loss_input的值一致
			if(this.skill_loss_input!=this.skill_loss)this.skill_loss_input = this.skill_loss;
		}
	},
	computed:{
		skill_loss : () => gp_store.state.skill_loss,
		g_round : () => gp_store.state.running_round,
		version: () =>gp_store.state.version
	},
	methods:{
		g_round_inc : () => gp_store.commit('incRound',1)
	}
});

//--模态框View--//
var gameModalView = new Vue({
	el:'#gameModalView',
	data:{
		inputvalue:'',//输入值
		allowContain:false, // 是否可以选择已使用过的卡牌
		notOnlySpecial:true, // 不必须是灾难卡
		table_deck:tableDeck.getDeck(),
		select_show_deck:selectShowDeck.getDeck(),
		special_target_deck:specialTargetDeck.getDeck()
	},
	computed:{
		special : () => gp_store.state.special,
		hazard : () => gp_store.state.hazard
	},
	methods:{
		filtedDeck: function(deck){ 
			return deckFilter(deck,(card)=>
				card!=this.special && //不包含当前选中的技能卡
				(this.allowContain||!specialDeck.contain(card)) && //不包含已使用过的技能卡
				(this.notOnlySpecial || card.getCardSpecial()!='None') // 必须是技能卡
			);
		}
	}
});

//游戏主界面View及逻辑//
var gamingview = new Vue({
	el:'#gamingview',
	data:{
		robinson_age:0,
		table_deck:tableDeck.getDeck(),
		pirate_deck:pirateDeck.getDeck(),
		robinson_deck:robinsonDeck.getDeck(),
		hazard_deck:hazardDeck.getDeck(),
		special_deck:specialDeck.getDeck(),
		destory_deck:destoryDeck.getDeck(),
		discard_deck:discardDeck.getDeck(),
		discard_hazard_deck:discardHazardDeck.getDeck(),
		max_card_value:Math.max(tableDeck.getDeck())
	},
	watch:{
		table_deck : function() {
			this.max_card_value = tableDeck.maxCardValue();
			// 监听被从table中移除的ageCard-岁数减小
			this.robinson_age = tableDeck.countTypeClassSum(AgeCard) + robinsonDeck.countTypeClassSum(AgeCard) + discardDeck.countTypeClassSum(AgeCard);
		},
		robinson_deck : function() {
			// 监听岁数增长
			this.robinson_age = tableDeck.countTypeClassSum(AgeCard) + robinsonDeck.countTypeClassSum(AgeCard) + discardDeck.countTypeClassSum(AgeCard);
		}
	},
	computed:{
		skill_loss : () => gp_store.state.skill_loss,
		tired_adjust : () => gp_store.state.tired_adjust,
		each_card_plus : () => gp_store.state.each_card_plus,
		can_pick : () => gp_store.state.can_pick,
		g_round : () => gp_store.state.running_round,
		g_phase : () => gp_store.state.running_phase,
		free_card : () => gp_store.state.hazard.getFreeCard(),
		hazard : () => gp_store.state.hazard,
		special : () => gp_store.state.special,
		phase_adjust : () => gp_store.state.phase_adjust,
		fight_adjust : () => gp_store.state.fight_adjust,
		robinson_adjust : () => gp_store.state.robinson_adjust,
		highest_card_zero : () => gp_store.state.highest_card_zero,
		thorns_injury : () => gp_store.state.thorns_injury
	},
	methods:{
		pickRobinson : function(){// 防止抽卡自杀
			already_pick = tableDeck.size();
			if(gp_store.state.running_life<=0){
				if(this.free_card==0){
					warn_yellow('回天无力','系统侦测到您已无力挽回局面！');
					console.log('回天无力,系统侦测到您已无力挽回局面！');
					return gameEnd(false);
				}//0血0free卡时，自动游戏失败
				if(already_pick>=this.free_card){
					warn_yellow('操作错误','您已经很累了，不能继续选择战斗了！');
					return;
				}
			}
			var addFightCardSuccess = addOneFightCard(tableDeck);
			//console.log('抽取卡牌:'+c.getName()+"("+already_pick+"/"+this.free_card+")");
			if(already_pick>=this.free_card && addFightCardSuccess){
				warn_yellow('注意!','疲劳战斗:扣'+Math.abs(-1*this.tired_adjust)+'点生命值!');
				gp_store.commit('incLife',-1*this.tired_adjust);
			}
		},
		stopFight : function(){
			if(tableDeck.size()==0) return warn_yellow('操作错误','请至少战斗一次！'); // 至少得抽取一张战斗卡
			
			if(this.thorns_injury){ // 计算荆棘伤害
				gp_store.commit('incLife',-1*tableDeck.size());
				warn_red('荆棘伤害','受到来自海盗的荆棘伤害: '+tableDeck.size()+' !');
				if(gp_store.state.running_life<0) {
					return gameEnd(false);
				}
			}
			//console.log('修正阶段难度:'+this.g_phase+this.phase_adjust);
			hazard_value = this.hazard.getHardToBeat(this.g_phase+this.phase_adjust);
			fight_value = tableDeck.getValueSum() - this.skill_loss*specialDeck.getValueSum(); // 战斗总值减去使用了技能的牌
			// console.log('开始结算:'+fight_value+"/"+hazard_value);
			// 战斗力加上各种调整值
			balance_value = (fight_value - hazard_value + this.fight_adjust + this.each_card_plus*(tableDeck.size()-this.skill_loss*specialDeck.size())-(this.highest_card_zero?this.max_card_value:0))*this.robinson_adjust;
					
			if(balance_value>=0){
				if(this.hazard instanceof HazardCard){
					warn_green('挑战成功!','['+this.hazard.getName()+']置入知识库! 鲁滨逊在休息后，恢复 1 点生命值!');
					gp_store.commit('incLife',1);
					if(balance_value>=5){ // 修订过的规则：若战斗力超过所需的5点及以上，恢复1点生命值
						warn_green('勇气大增!','鲁滨逊重新鼓起信心，恢复 1 点生命值!');
						gp_store.commit('incLife',1);
					}
					discardDeck.addCard(this.hazard);// 灾难知识卡片 -> 鲁滨逊弃牌堆
				} else {
					gp_store.commit('incPirateKilled',1);
					warn_green('挑战成功!','海盗:['+this.hazard.getName()+']被击杀!');
					destoryDeck.addCard(this.hazard);// 海盗卡片 -> 废牌堆
				}
				tableDeck.moveTo(discardDeck);// 清空桌面卡片 -> 鲁滨逊弃牌堆
				roundStart(); // 无伤情况下新回合开始准备下一回合的灾难卡
			} else {
				if(this.g_phase>=4 && !(this.hazard instanceof HazardCard)){
					// 海盗战役被海盗卡击败(非hazard则为pirate)
					warn_red('凶残的海盗','海盗将你杀死在沙滩上');
					console.log('海盗将你击杀');
					return gameEnd(false);
				}
				// 挑战失败: 扣血 -> 弃置/移除卡片
				gp_store.commit('incLife',balance_value);
				warn_yellow('注意!','战斗失败:扣'+balance_value+'点生命值!');
				if(gp_store.state.running_life<0){// 玩家死亡
					return gameEnd(false);
				}
				discardHazardDeck.addCard(this.hazard);
				gp_store.commit('setLostLife',Math.abs(balance_value));// 记录损失的生命
				//destoryCard();// 花生命值移除卡牌{{}} -> gp_store.commit('rstLostLife'); -> roundStart();
				tableDeck.moveTo(selectShowDeck);  // selectShowDeck -> 剩余桌面卡片 -> 鲁滨逊弃牌堆
				showBootstrapModal('#destoryCardModal'); // -> Modal -> destoryCard(); -> roundStart();
			}
			// :回合状态恢复-无论是否伤血
			//gp_store.commit('setHazard',new HazardCard()); // 视觉效果:显示back.jpg
			//gp_store.commit('rstRoundAdjust'); // 重置回合中各种战斗调整系数
			//specialDeck.cleanDeck();// 特殊卡牌堆清零
		},
		useSpecial : function(){
			if(gp_store.state.debug)console.log('准备使用特技:'+this.special.getName());
			doSpecial('cast',this.special);
		},
		countValueSum : countValueSum
	}
})
// gameProcessing() End //