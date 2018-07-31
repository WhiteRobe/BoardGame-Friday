/*
使用能力的逻辑:
Layer:View ───> doSpecial() ───>(index) ───> Layer:View:Modal ───> specialCarrier()/specialCancel()/specialType()
     ^              │                              ^                    │
	 │		     	│                              └────────<───────────┤
	 │		     	v                                                   v
	 │		    [部分能力]                                         [剩余能力]
	 │	            └──────────────────>  [恢复状态]  <─────────────────┘
	 │                                        │(selectShowDeck/specialTargeDeck:cleanDeck)
	 └────<─────────(notify)─────<────────────┘(Modal:hide)	 
*/
// 使用特殊能力 - index
function doSpecial(method,card){
	if(method=='add'){
		specialDeck.addCard(card);
	} else if(method=='remove'){
		specialDeck.removeCard(card);
	} else if (method=='cast'){
		sp = card.getCardSpecial();
		// 具体特技的释放
		if(sp == '-1 Life'){ // 衰老卡特技1
			gp_store.commit('incLife',-1);
			warn_red("年老体衰","糟糕！受到衰老影响，生命-1!");
		} else if (sp == '-2 Life'){// 衰老卡特技2
			gp_store.commit('incLife',-2);
			warn_red("年老体衰","糟糕！受到衰老影响，生命-2!");
		} else if(sp == 'Highest Card=0'){// 衰老卡特技3
			gp_store.commit('setHighestCardZero',true);
			warn_red("年老体衰","受到衰老影响，分值最高卡牌战斗力归零!");
		} else if(sp == 'Stop'){// 衰老卡特技4
			gp_store.commit('setCanPick',false);
			warn_red("年老体衰","受到衰老影响，停止抽卡!");
		} else if(sp == '+2 Life'){ // 鲁滨逊卡/知识卡特技1
			gp_store.commit('incLife',2);
			warn_green("稍作休整","饱餐一顿，生命+2!");
			gp_store.commit('setSpecial',undefined);
		} else if(sp == '+1 Life'){
			gp_store.commit('incLife',1);
			warn_green("稍作休整","包扎伤口，生命+1!");
			gp_store.commit('setSpecial',undefined);
		} else if(sp == 'Destory 1' || sp == 'Place 1'){
			tableDeck.copyTo(selectShowDeck);
			showBootstrapModal('#chooseCardModal'); // 功能移交到 -> 组件:bootstrap-select-modal
		} else if(sp == 'Exchange 1' || sp == 'Exchange 2' || sp == 'Double 1'){
			gameModalView.allowContain=true;//允许选中已使用过技能的卡牌:替换已使用过技能卡牌后要移除specialDeck
			tableDeck.copyTo(selectShowDeck);
			showBootstrapModal('#chooseCardModal'); // 功能移交到 -> 组件:bootstrap-select-modal
		} else if(sp == 'Copy 1'){
			gameModalView.notOnlySpecial = false;
			tableDeck.copyTo(selectShowDeck);
			showBootstrapModal('#chooseCardModal'); // 功能移交到 -> 组件:bootstrap-select-modal
		} else if(sp=='Vision'){
			for(var i=0;i<3;i++){
				addOneFightCard(selectShowDeck);// 功能移交到 -> 组件:bootstrap-select-modal
				if(gp_store.state.debug)console.log('Vision:['+i+']-'+selectShowDeck.lastCard().getName());
			}if(gp_store.state.debug)console.log('Vision Total:'+selectShowDeck.size());
			showBootstrapModal('#chooseCardModal');
		} else if(sp == '+2 Card'){
			showBootstrapModal('#selectAddCardModal'); // 功能移交到 -> 组件:bootstrap-select-modal
		} else if(sp == '+1 Card'){
			addOneFightCard(tableDeck);
			warn_green("战术动作","灵敏机动，战斗卡+1!");
			gp_store.commit('setSpecial',undefined);
		} else if(sp == 'Phase -1'){
			if(gp_store.state.running_phase<=1 || gp_store.state.running_phase>=4){
				if(gp_store.state.running_phase>=4 && gp_store.state.hazard instanceof HazardCard){
					gp_store.commit('setPhaseAdjust',-2); // 攻击海盗的小弟时,可以调整阶段
					warn_green("战术动作","击破弱点，阶段暂时回归第 2 阶段!");
				}
				else warn_yellow("操作错误","海盗战阶段和第一阶段无法使用该卡!");
			} else {
				gp_store.commit('setPhaseAdjust',-1);
				warn_green("战术动作","击破弱点，阶段暂时-1!");
				gp_store.commit('setSpecial',undefined);
			}
		}
	} else console.log('请重启游戏![Error 01-1]未知技能:'+sp);
}
function getSpecialTarget(sp){
	if(sp=='Place 1') return 1;
	else if(sp=='Destory 1') return 1;
	else if(sp=='Double 1') return 1;
	else if(sp=='Exchange 1') return 1;
	else if(sp=='Exchange 2') return 2;
	else if(sp=='Vision') return 1;
	else if(sp=='Copy 1') return 1;
	else return -1;
}
// [特殊能力消耗者]:确认或继续
function specialCarrier(card){
	let sp = card.getCardSpecial();
	if(sp=='+2 Card'){// 没有目标卡牌的技能->selectShowDeck
		if(selectShowDeck.size()<2) addOneFightCard(selectShowDeck);
		else {
			selectShowDeck.moveTo(tableDeck);
			specialCarrierConfirm('#selectAddCardModal');
			warn_green("战术动作","灵敏机动，战斗卡+2!");
		}
	} else if(sp=='Place 1'){// 有目标卡牌的技能->specialTargetDeck
		if(specialTargetDeck.empty()) return specialCancel(card);//没有使用技能
		let fr = specialTargetDeck.popCard();
		let fr_index_plus = tableDeck.findCard(fr)+1;
		if(fr_index_plus<=gp_store.state.hazard.getFreeCard()){//免费卡牌则进行替换
			addOneFightCard(tableDeck);
			tableDeck.switchCard(fr_index_plus-1,tableDeck.size()-1); //置换卡牌
		}
		tableDeck.removeCard(fr);// 将选中卡牌放到牌堆底
		robinsonDeck.addCard(fr);
		cancelAgeCardSp(fr); // 取消年龄卡技能
		// 重置状态
		specialCarrierConfirm('#chooseCardModal');
		warn_green("战术动作","重置/替换一张卡牌["+fr.getName()+"]至牌堆底!");
	} else if(sp=='Destory 1'){
		if(specialTargetDeck.empty()) return specialCancel(card);//没有使用技能
		let tar = specialTargetDeck.popCard();
		cancelAgeCardSp(tar); // 取消年龄卡技能
		tableDeck.removeCard(tar);// 移动到废牌堆
		destoryDeck.addCard(tar);
		specialCarrierConfirm('#chooseCardModal');
		warn_green("吸取教训","移除一张卡牌["+tar.getName()+"]至废牌堆!");
	} else if(sp=='Exchange 1' || sp=='Exchange 2'){
		if(specialTargetDeck.empty()) return specialCancel(card);//没有使用技能
		let exchange_num = specialTargetDeck.size();
		for(var i=0;i<exchange_num;i++){
			let tar = specialTargetDeck.popCard();
			cancelAgeCardSp(tar); // 取消年龄卡技能
			addOneFightCard(tableDeck);
			tableDeck.switchCard(tableDeck.findCard(tar),tableDeck.size()-1);// 交换
			tableDeck.removeCard(tar);// 移动到弃牌堆
			/*if(specialDeck.contain(tar))*/specialDeck.removeCard(tar); // 有可能包含被用过的技能卡，需要移除
			discardDeck.addCard(tar);
		}
		specialCarrierConfirm('#chooseCardModal');
		warn_green("头脑活络","更换了 "+exchange_num+" 张战术卡!");
	} else if(sp=='Double 1'){
		if(specialTargetDeck.empty()) return specialCancel(card);//没有使用技能
		let tar = specialTargetDeck.popCard();
		gp_store.commit('incFightAdjust',tar.getCardValue());
		specialCarrierConfirm('#chooseCardModal');
		warn_green("身强体壮","选中的卡牌["+tar.getCardValue()+"]点战力加倍(已自动统计)!");
	} else if(sp=='Vision'){// 没有目标卡牌的技能->selectShowDeck
		if(!specialTargetDeck.empty()){ // 至多可留一张卡牌
			let keep = specialTargetDeck.popCard();
			tableDeck.addCard(keep); // 留下卡牌
			selectShowDeck.removeCard(keep);
			warn_green("夜光星象","抽取了一张战斗卡!");
		}
		warn_gray("继续操作","为不需要的卡牌分配位置。");
		hideBootstrapModal('#chooseCardModal');
		specialTargetDeck.cleanDeck();//临时使用
		showBootstrapModal('#typeCardModal');//启用输入面板
	} else if(sp=='Copy 1'){
		if(specialTargetDeck.empty()) return specialCancel(card);//没有使用技能
		let tar = specialTargetDeck.popCard();
		if(tar.getCardSpecial()=='Copy 1') { // 对[Copy 1]卡进行复制，没有意义
			warn_yellow("这么做没有意义","无法对同为[Copy 1]的卡牌进行技能复制!");
			return specialCancel(card);
		}
		specialCarrierConfirm('#chooseCardModal');
		warn_green("火眼金睛","复制了["+tar.getName()+"]的技能:["+tar.getCardSpecial()+"]!");
		// 复制卡牌的技能启动
		gp_store.commit('setCopySpecial',tar);
		setTimeout(function(){doSpecial('cast',tar)},500);
	} else console.log('请重启游戏![Error 01-2]未知技能:'+sp);
}
// [特殊能力消耗者]:取消
function specialCancel(card){
	let sp = card.getCardSpecial();
	if(sp=='+2 Card'){
		if(selectShowDeck.size()>0){// 至少抽了一张卡，依然视为使用卡片
			selectShowDeck.moveTo(tableDeck);
			specialCarrierConfirm('#selectAddCardModal');
			warn_green("战术动作","灵敏机动，战斗卡+"+selectShowDeck.size()+"!");
		}
		else specialCarrierRollback('#selectAddCardModal');
	}
	else if(sp=='Place 1')specialCarrierRollback('#chooseCardModal');
	else if(sp=='Destory 1')specialCarrierRollback('#chooseCardModal');
	else if(sp=='Double 1')specialCarrierRollback('#chooseCardModal');
	else if(sp=='Exchange 1')specialCarrierRollback('#chooseCardModal');
	else if(sp=='Exchange 2'){
		if(specialTargetDeck.size()==1)specialCarrier(card);// 选择抽了一张卡，依然视为使用卡片
		else specialCarrierRollback('#chooseCardModal'); // 0、2时不认为使用了卡片
	} else if(sp=='Vision') warn_yellow("操作错误","[特技:Vision]无法取消!");  // 该技能无法取消
	else if(sp=='Copy 1')specialCarrierRollback('#chooseCardModal');
	else console.log('请重启游戏![Error 01-3]未知技能:'+sp);
	//doSpecial('remove',card);
}
// 输入确认
function specialType(card){
	let sp = card.getCardSpecial();
	if(sp=='Vision'){
		var reg = /^(0|[1-9][0-9]*)$/; // 自然数
		if(!reg.test(gameModalView.inputvalue)){
			gameModalView.inputvalue = '1';
			return warn_yellow('操作错误','请输入自然数(已自动填入 [1] )');
		}
		var value = parseInt(gameModalView.inputvalue);
		gameModalView.inputvalue='';//恢复空白状态
		let maxTypeValue = robinsonDeck.size()>0?robinsonDeck.size():1;
		if(value<=0 || value>maxTypeValue){
			warn_yellow('操作错误','只能输入1~'+maxTypeValue+'的值');
			return;
		}
		if(!selectShowDeck.empty()){
			let c_card = selectShowDeck.popCard();
			robinsonDeck.addCardTo(value-1,c_card);
			warn_green('分配成功','将['+c_card.getName()+']分配到牌堆第:'+value+'张处，请继续分配剩余的卡牌。');
		}
		// 如果全部处理完，就退出
		if(selectShowDeck.empty()){
			warn_green('夜观星象','已将所有卡牌分配到预定的位置');
			specialCarrierConfirm('#typeCardModal');
		}
	} else console.log('请重启游戏![Error 01-4]未知技能:'+sp);
}
// [恢复状态]:确认
function specialCarrierConfirm(id){
	gameModalView.allowContain = false;//恢复状态
	gameModalView.notOnlySpecial = true;
	selectShowDeck.cleanDeck();
	specialTargetDeck.cleanDeck();
	gp_store.commit('setSpecial',undefined);
	hideBootstrapModal(id);
}
// [恢复状态]:取消特技
function specialCarrierRollback(id){
	gameModalView.allowContain = false;//恢复状态
	gameModalView.notOnlySpecial = true;
	selectShowDeck.cleanDeck();
	specialTargetDeck.cleanDeck();
	hideBootstrapModal(id);
}
// 取消衰老卡的技能
function cancelAgeCardSp(card){
	if(card.getCardSpecial() == 'Stop'){// [衰老卡:stop]可以被Place取消效果
		gp_store.commit('setCanPick',true);
	} else if(card.getCardSpecial() == 'Highest Card=0'){// [衰老卡:Highest Card=0]可以被Place取消效果
		gp_store.commit('setHighestCardZero',false);
	} else if(card.getCardSpecial() == '-2 Life'){
		gp_store.commit('incLife',2);
		warn_green('重获青春','生命值恢复 2 点!');
	} else if(card.getCardSpecial() == '-1 Life'){
		gp_store.commit('incLife',1);
		warn_green('重获青春','生命值恢复 1 点!');
	}
}