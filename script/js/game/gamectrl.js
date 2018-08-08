/*
游戏逻辑：
:initGame [载入资源、解析界面、加载数据]
    │
	v				(pirateReset)
resetParams()   <──────────────────  resetGame()
    │                                    ^     
    └─>:选择难度  ──>  deckRest()        │
	                      │              │
doWhenChoosedDiff()   <───┘              │
    │                                    │
	v                                    │
gameStart()                              │
    │                                    │
	v                                    │
gameCheat()	 ─·─·─·>  roundStart() <──┐  ^ 
    │                     │           │  │
    │    (init)           v           │  │
    └─>:选择灾难──> prepareHazard()   │  │
                          │           │  │	
	           (setHazard)│           │  │	
pirateAttack()  <·─·─·─·─·┤           │  │	
	│                     │           │  │
	└──> {isPhaseEnd?phaseEnd():pass} │  │	
	                      │           │  │							  
:gameProcessing    <──────┘           │  │
    │(结算stopFight())                │  │
	│                                 │  │	
	│ *   (挑战胜利)                  │  │
    ├─┬───────>─────────────:LOOP─────┤  │
	│ │                               │  │
	│ │   (损失生命值)                │  │
    │ └─>:destroyCard()─>───:LOOP──>──┘  │
    │                                    │
	v                                    │
gameEnd()  ───────>───pushToServer()─────┘
*/
// 重置游戏
function resetGame(){
	pirateRest(); // 重置海盗属性
	resetParams();// 重置参数:页面恢复
	ageDeck.cleanDeck();
	robinsonDeck.cleanDeck();
	hazardDeck.cleanDeck(); //3
	selectShowDeck.cleanDeck();
	pirateDeck.cleanDeck();
	discardDeck.cleanDeck();//6
	discardHazardDeck.cleanDeck();
	destoryDeck.cleanDeck();
	tableDeck.cleanDeck();//9
	specialDeck.cleanDeck();
	specialTargetDeck.cleanDeck();
}
// 重置基本参数
function resetParams(){
	gp_store.commit('rst');
}
// 难度选择后的初始化
function doWhenChoosedDiff(diff){
	deckReset();
	gp_store.commit('setLife',20);
	if(diff<=params_diff.yellow){
		if(gp_store.state.debug)console.log('移除:痴呆'); // c_age01
		destoryDeck.addCard(c_age01);
		ageDeck.removeCard(c_age01);
	}
	if(diff>=params_diff.yellow){
		if(gp_store.state.debug)console.log('加入一张衰老卡');
		var c_ = ageDeck.popCard();
		robinsonDeck.addCard(c_);
		robinsonDeck.shuffle();
	}
	if(diff>=params_diff.orange){
		gp_store.commit('setLife',18);
		gp_store.commit('setSkillLoss',gp_store.state.skill_loss+1);
	}
	warn_green('游戏提示','当前游戏难度为:'+diff+',技能损耗为:'+gp_store.state.skill_loss);
	gameStart();
}
function gameStart(){
	if(gp_store.state.debug)console.log('游戏开始');
	gamacheat();
	roundStart();
}
// 回合开始
function roundStart(){
	gp_store.commit('setHazard',new HazardCard()); // 视觉效果:显示back.jpg
	gp_store.commit('rstRoundAdjust'); // 重置回合中各种战斗调整系数
	selectShowDeck.cleanDeck();// Modal显示卡牌堆清零
	specialDeck.cleanDeck();// 特殊卡牌堆清零
	if(pirateDeck.size()==0) gameEnd(true); // 游戏获胜
	else prepareHazard();
}
// 每阶段结束后做的调整
function phaseEnd(){
	let diff = gp_store.state.running_diff;
	if(diff==params_diff.green){
		gp_store.commit('incLife',10);
		warn_green('暴风雨后的宁静','鲁滨逊生命值增加10点');
	} else if (diff==params_diff.yellow){
		gp_store.commit('incLife',5);
		warn_green('暴风雨后的宁静','鲁滨逊生命值增加5点');
	} else if(diff==params_diff.red){
		gp_store.commit('incLife',3);
		warn_green('暴风雨后的宁静','鲁滨逊生命值增加3点');
	} else {
		gp_store.commit('incLife',1);
		warn_green('暴风雨后的宁静','鲁滨逊生命值增加1点');
	}
}
// 毁灭卡牌
function destoryCard(){
	for(var i=0;i<specialTargetDeck.size();i++){
		var c = specialTargetDeck.getDeck()[i];
		selectShowDeck.removeCard(c);
		destoryDeck.addCard(c);
	}
	selectShowDeck.moveTo(discardDeck);
	gp_store.commit('rstLostLife');
	selectShowDeck.cleanDeck();
	specialTargetDeck.cleanDeck();
	hideBootstrapModal('#destoryCardModal');
	roundStart();
}
// 海盗进攻
function pirateAttack(pirate){
	var sp = pirate.getCardSpecial();
	if(gp_store.state.debug)console.log('海盗技能:'+sp);
	if(sp=='Each Card Worth+1'){
		gp_store.commit('setEachCardPlus',1);
		warn_green('毫无纪律的海盗','每张战斗卡的战斗值加 1 !');
		console.log('毫无纪律的海盗,每张战斗卡的战斗值加 1 !');
	} else if(sp=='Each New Card Cost 2 Life') {
		gp_store.commit('setTiredAdjust',2);
		warn_red('酒精麻醉','每张额外战斗卡需要多支付一点生命值!');
		console.log('酒精麻醉,每张额外战斗卡需要多支付一点生命值!');
	} else if(sp=='Power * 2 Of New Aging Card'){
		let new_fight = 2 * robinsonDeck.countTypeClassSum(AgeCard);
		pirate.setHardToBeat(new_fight);
		if(new_fight==0) {
			warn_green('续命失败','这个海盗没有从你身上吸取到时间!战斗力为0。');
			console.log('续命失败,这个海盗没有从你身上吸取到时间!战斗力为0。');
		}
		else {
			warn_red('时间魔法','这个海盗的战斗力为'+new_fight+'!');
			console.log('时间魔法,这个海盗的战斗力为'+new_fight+'!');
		}
	} else if(sp=='Power * 2 Of Last Battles') {
		if(discardHazardDeck.size()==0){ // 这里的规则为：返回2*上一张灾难卡的3阶段战力值（未通过的>通过的）
			if(hazardDeck.size()==0){
				pirate.setHardToBeat(0);
				warn_green('畏缩不前','这个海盗被你的勇猛吓到了!战斗力为0。');
				console.log('畏缩不前,这个海盗被你的勇猛吓到了!战斗力为0。');
			} else {
				let last_battle_dec = hazardDeck.lastCard();
				hazardDeck.removeCard(last_battle);
				let new_fight = Math.abs(last_battle_dec.getHardToBeat(3));
				pirate.setHardToBeat(new_fight);
				warn_yellow('朗姆酒壮胆','这个海盗的战斗力为'+new_fight+'!');
				console.log('朗姆酒壮胆,这个海盗的战斗力为'+new_fight+'!');
			}
		} else {
			let last_battle = discardHazardDeck.lastCard();
			discardHazardDeck.removeCard(last_battle);
			let new_fight = 2 * Math.abs(last_battle.getHardToBeat(3));
			pirate.setHardToBeat(new_fight);
			warn_red('嘲笑弱者','这个海盗看不起你，他的战斗力为'+new_fight+'!');
			console.log('嘲笑弱者这个海盗看不起你，他的战斗力为'+new_fight+'!');
		}
	} else if(sp=='Fight Remain Hazard'){
		if(discardHazardDeck.size()==0){
			pirate.setHardToBeat(0);
			warn_green('众叛亲离','这个海盗的船员谋反了!战斗力为0。');
			console.log('众叛亲离,这个海盗的船员谋反了!战斗力为0。');
		} else {
			discardHazardDeck.moveTo(pirateDeck);
			pirateDeck.switchCard(0,pirateDeck.size()-1); // 把第二个海盗放最后
			gp_store.commit('setHazard',pirateDeck.popCard());// 换成第一个小弟
			warn_red('蜂拥而至','这个海盗和他的船员们一拥而上!');
			console.log('蜂拥而至,这个海盗和他的船员们一拥而上!');
		}
	} else if(sp=='Only Half Battle Cards Counts'){// 这里改为鲁滨逊战力值*0.5
		gp_store.commit('setRobinsonAdjust',0.5);
		warn_red('暗箭伤人','鲁滨逊的战斗值减半了!');
	} else if(sp=='No Free Card'){
		warn_red('小气鬼海盗','鲁滨逊将没有免费战斗卡可以抽取!');
	} else if(sp.indexOf("Poison")!=-1){
		let poison = parseInt(sp.replace('Poison ',''));
		gp_store.commit('incLife',-1*poison);
		warn_red('带毒利刃','鲁滨逊受到了 '+ poison+' 点毒素伤害!');
		if(gp_store.state.running_life<0) return gameEnd(false); // 被毒死
	} else if(sp=='Thorns'){
		gp_store.commit('setThornsInjury',true);
		warn_red('反伤伤害','鲁滨逊结束战斗后将会受到等同于已打出卡牌的数目的伤害!');
	} else console.log('请重启游戏![Error 02-1]未知海盗技能:'+sp);
}
// 游戏结束
function gameEnd(isWin){
	var score = countScore();
	if(isWin){
		warn_green('逃出生天','挑战胜利!您的得分是: '+score+' !');
		resetGame();
	} else {
		warn_red('尸埋孤岛','挑战失败!您的得分是: '+score+' ，游戏重置!');
		resetGame();
	}
	alert('游戏结束'+(isWin?'胜利':'失败')+',得分: '+score+' !');
	console.log('游戏结束'+(isWin?'胜利':'失败')+',得分: '+score+' !');
	pushToServer(gp_store.state.user_id,score);
}
// 将分数发送到服务器
function pushToServer(id,score){
	// No Server Now
	let time = new Date().toLocaleString();
	let serverAddress = gp_store.state.server_address;
	/* 
	// io静态网页版禁用计分功能
	$(document).ready(function () {
		$.get(serverAddress,{userId:id,userScore:score},function(result,stat){
			if(stat!='success'){
				$.growl.error({
					title: '提交失败',
					message: '未连接到服务器!'
				});
			} else {
				$.growl.notice({
					title: '排行榜更新',
					message: '成绩保存成功!'
				});
			}
		});
	});*/
}
// initGame() Begin: //
// 卡牌堆 x 11
/*
卡牌堆逻辑：
                             pirateDeck                        ║
                                 │                             ║
                                 v                             ║  
ageDeck ──>robinsonDeck ──> (gp_store.hazard)  <──  hazardDeck ║
             │    ^              │                       ^     ║  (Modal控制)
destoryDeck  │    │     ┌────────┴───────────┐           │     ║
    ^        v    │     │                    │           │    ==> ─┐        
	└── tableDeck │     v			         v           │     ║   │(@点击使用技能按钮)
             ^ └─>┴─ discardDeck      discardHazardDeck ─┘     ║   │
═════════════│══════════════(数据层)═══════════════════════════╩═══│══════════
             v                                                     v
     :specialDeck <──>   :specialTargetDeck  <────────────>  :selectShowDeck
*/
var ageDeck = new CardDeck(); // 衰老卡卡堆
var robinsonDeck = new CardDeck(); // 鲁滨逊卡堆
var hazardDeck = new CardDeck(); // 灾难卡堆
var selectShowDeck = new CardDeck(); // *Modal中临时的显示列表卡堆
var pirateDeck = new CardDeck(); // 海盗卡牌堆
var discardDeck = new CardDeck(); // 通过的灾难卡弃牌堆
var discardHazardDeck = new CardDeck(); // 未通过的灾难卡弃牌堆
var destoryDeck = new CardDeck(); // 移出游戏的卡
var tableDeck = new CardDeck(); // 桌面上打出的卡
var specialDeck = new CardDeck(); // *使用过special的卡堆
var specialTargetDeck = new CardDeck(); // *specialDeck卡的对象

// 重置牌堆
function deckReset(){
	ageDeck.cleanDeck();
	// hard age card 05 09 11
	ageDeck.addCard(c_age01);ageDeck.addCard(c_age02);
	ageDeck.addCard(c_age03);ageDeck.addCard(c_age04);
	/*ageDeck.addCard(c_age05);*/ageDeck.addCard(c_age06);
	ageDeck.addCard(c_age07);ageDeck.addCard(c_age08);
	/*ageDeck.addCard(c_age09);*/ageDeck.addCard(c_age10);
	/*ageDeck.addCard(c_age11);*/ageDeck.addCard(c_age12);
	ageDeck.shuffle();
	// 乱序的困难卡牌在最底下
	var tempAgeCardDeck = new CardDeck();
	tempAgeCardDeck.addCard(c_age05);tempAgeCardDeck.addCard(c_age09);tempAgeCardDeck.addCard(c_age11);
	tempAgeCardDeck.shuffle();
	ageDeck.addCard(tempAgeCardDeck.popCard());
	ageDeck.addCard(tempAgeCardDeck.popCard());
	ageDeck.addCard(tempAgeCardDeck.popCard());
	
	robinsonDeck.cleanDeck();
	robinsonDeck.addCard(c_robinson01);robinsonDeck.addCard(c_robinson02);robinsonDeck.addCard(c_robinson03);
	robinsonDeck.addCard(c_robinson04);robinsonDeck.addCard(c_robinson05);robinsonDeck.addCard(c_robinson06);
	robinsonDeck.addCard(c_robinson07);robinsonDeck.addCard(c_robinson08);robinsonDeck.addCard(c_robinson09);
	robinsonDeck.addCard(c_robinson10);robinsonDeck.addCard(c_robinson11);robinsonDeck.addCard(c_robinson12);
	robinsonDeck.addCard(c_robinson13);robinsonDeck.addCard(c_robinson14);robinsonDeck.addCard(c_robinson15);
	robinsonDeck.addCard(c_robinson16);robinsonDeck.addCard(c_robinson17);robinsonDeck.addCard(c_robinson18);
	robinsonDeck.shuffle();
	
	hazardDeck.cleanDeck();
	selectShowDeck.cleanDeck();
	hazardDeck.addCard(c_hazard01);hazardDeck.addCard(c_hazard02);hazardDeck.addCard(c_hazard03);
	hazardDeck.addCard(c_hazard04);hazardDeck.addCard(c_hazard05);hazardDeck.addCard(c_hazard06);
	hazardDeck.addCard(c_hazard07);hazardDeck.addCard(c_hazard08);hazardDeck.addCard(c_hazard09);
	hazardDeck.addCard(c_hazard10);hazardDeck.addCard(c_hazard11);hazardDeck.addCard(c_hazard12);
	hazardDeck.addCard(c_hazard13);hazardDeck.addCard(c_hazard14);hazardDeck.addCard(c_hazard15);
	hazardDeck.addCard(c_hazard16);hazardDeck.addCard(c_hazard17);hazardDeck.addCard(c_hazard18);
	hazardDeck.addCard(c_hazard19);hazardDeck.addCard(c_hazard20);hazardDeck.addCard(c_hazard21);
	hazardDeck.addCard(c_hazard22);hazardDeck.addCard(c_hazard23);hazardDeck.addCard(c_hazard24);
	hazardDeck.addCard(c_hazard25);hazardDeck.addCard(c_hazard26);hazardDeck.addCard(c_hazard27);
	hazardDeck.addCard(c_hazard28);hazardDeck.addCard(c_hazard29);hazardDeck.addCard(c_hazard30);
	hazardDeck.shuffle();
	
	pirateDeck.cleanDeck();
	pirateDeck.addCard(c_pirate01);pirateDeck.addCard(c_pirate02);
	pirateDeck.addCard(c_pirate03);pirateDeck.addCard(c_pirate04);
	pirateDeck.addCard(c_pirate05);pirateDeck.addCard(c_pirate06);
	pirateDeck.addCard(c_pirate07);pirateDeck.addCard(c_pirate08);
	pirateDeck.addCard(c_pirate09);pirateDeck.addCard(c_pirate10);
	pirateDeck.addCard(c_pirate11);pirateDeck.addCard(c_pirate12);
	pirateDeck.addCard(c_pirate13);pirateDeck.addCard(c_pirate14);pirateDeck.addCard(c_pirate15);// expend pirate card
	pirateDeck.shuffle();
	// 只留两张海盗卡
	var temp_pirate1=pirateDeck.popCard();
	var temp_pirate2=pirateDeck.popCard();
	pirateDeck.cleanDeck();
	pirateDeck.addCard(temp_pirate1);pirateDeck.addCard(temp_pirate2);
	
	discardDeck.cleanDeck();
	discardHazardDeck.cleanDeck();
	destoryDeck.cleanDeck();
	tableDeck.cleanDeck();
	specialDeck.cleanDeck();
	specialTargetDeck.cleanDeck();
}
// initGame() End //

// 功能 Function //
// 卡牌堆求Value的总和
function countValueSum(deck){
	var total = 0;
	for(var i=0;i<deck.length;i++){
		total += deck[i].getCardValue();
	}
	return total;
}
// 从CardDeck的inner.deck中过滤出想要的值
function deckFilter(deck,func){
	var n_deck = new CardDeck();
	for(var i=0;i<deck.length;i++){
		if(func(deck[i])) n_deck.addCard(deck[i]);
	}
	return n_deck;
}
// 抽取两张灾难卡
function prepareHazard(){
	if(pickOneHazardCard() && pickOneHazardCard()){
		showBootstrapModal('#selectHazradModal');
	} else { // 转入海盗阶段
		if(gp_store.state.running_phase!=4) {
			phaseEnd(); // 前两阶段结束后做的调整 // 临时BUG fix
			gp_store.commit('setPhase',4); // 强制进入4阶段(海盗阶段)
		}
		var pirate = pirateDeck.popCard()
		gp_store.commit('setHazard',pirate);
		pirateAttack(pirate);
		warn_red("海盗袭击","海盗:["+pirate.getName()+"]正在攻击！");
		if(gp_store.state.debug)console.log("海盗袭击:["+pirate.getName()+"]正在攻击！");
	}
	
}
function pickOneHazardCard(){
	// 结算完毕：抽取新的灾难卡/海盗卡
	if(gp_store.state.running_phase>=4){ // 海盗战役已开始
		return false;
	} 
	if(hazardDeck.size()==0){
		if(gp_store.state.running_phase>=3 || discardHazardDeck.size()<2){// 开始海盗战役
			return false;
		} else { // 洗灾难牌
			discardHazardDeck.moveTo(hazardDeck);
			hazardDeck.shuffle();
		}
		gp_store.commit('incPhase',1);
		warn_yellow('暴雨来袭','游戏阶段+1!');
		phaseEnd(); // 前两阶段结束后做的调整 // 临时BUG fix
	}
	selectShowDeck.addCard(hazardDeck.popCard());
	return true;
}
// 以安全的方式直接添加一张战斗卡到targetDeck
function addOneFightCard(targetDeck){
	if(robinsonDeck.size()==0){
		if(discardDeck.size()==0){// 防止开局抽过多的卡牌导致游戏规则崩坏
			warn_yellow('操作错误','您的后备知识库不足，请停止战斗！');return false;
		}
		// 牌库不足，自动将弃牌堆乱序洗入待抽牌库 -> 回合数+1
		if(!ageDeck.empty()){ // 加入一张衰老卡
			discardDeck.addCard(ageDeck.popCard());
			warn_yellow('岁月无情','您又老了一岁(一张衰老卡已加入卡组)。');
		} else{ // 衰老卡不足
			warn_green('见多识广','鲁滨逊掌握了神秘的时间魔法，不收衰老的影响，没有衰老卡加入卡组。');
		}
		discardDeck.moveTo(robinsonDeck);
		robinsonDeck.shuffle();
	}
	c = robinsonDeck.popCard();
	targetDeck.addCard(c);
	return true;
}
// 计算总分
function countScore(){
	var ageCardSum = robinsonDeck.countTypeClassSum(AgeCard) + discardDeck.countTypeClassSum(AgeCard);
	var fightScore = robinsonDeck.size() + discardDeck.size() - ageCardSum;
	var ageScore = -5 * ageCardSum;
	var pirateScore = 15 * gp_store.state.pirate_killed;
	var healthScore = 5 * (gp_store.state.running_life>0?gp_store.state.running_life:0);
	var discardHazardScore = -3*discardHazardDeck.size();
	var diff = gp_store.state.running_diff;
	if(diff==1) diff=1.0;
	else if(diff==2) diff=1.2;
	else if(diff==3) diff=1.5;
	else if(diff==4) diff=2.0;
	else diff=1;
	var skill_loss = gp_store.state.skill_loss+1.0;
	return skill_loss*diff*(fightScore+ageScore+pirateScore+healthScore+discardHazardScore);
}
// 音乐播放组件
var myAudio = new Audio();
var playAudio = function(){
	var arr = [ "./res/audio/2-03 Peaceful Moment.ogg",
				"./res/audio/05 305 - Heresy (Organ, Loop).ogg",
				"./res/audio/3-06 Cool Stuff.ogg",
				"./res/audio/01 300-A - Desecrated Temple.ogg",
				"./res/audio/2-03 291-C - Night 2.ogg",
				].sort(() => Math.random()>0.5 ? -1 : 1); // 随机播放
	
	myAudio.preload = true;
	myAudio.controls = true;
	myAudio.src = arr.pop(); // 每次读数组最后一个元素
	myAudio.addEventListener('ended',playEndedHandler,false);
	myAudio.play();
	document.getElementById("audioBox").appendChild(myAudio);
	myAudio.loop=false; // 禁止循环，否则无法触发ended事件
	function playEndedHandler(){
		myAudio.src=arr.pop();
		myAudio.play();
		if(gp_store.state.debug)console.log('Now Play Audio:'+myAudio.src);
		if(arr.length==0){ // 循环播放设置
			arr = [ "./res/audio/2-03 Peaceful Moment.ogg",
				"./res/audio/05 305 - Heresy (Organ, Loop).ogg",
				"./res/audio/2-03 291-C - Night 2.ogg",
				"./res/audio/3-06 Cool Stuff.ogg",
				"./res/audio/01 300-A - Desecrated Temple.ogg"].sort(() => Math.random()>0.5 ? -1 : 1);
			
		}
		//!arr.length && myAudio.removeEventListener('ended',playEndedHandler,false);//只有一个元素时解除绑定
	}
}
function pauseAudio(){
	myAudio.pause();
}
function replayAudio(){
	myAudio.play();
}

// View Helper Function
function warn_red(t,msg){
	$(document).ready(function () {
		$.growl.error({
			title: t,
			message: msg
		});
	});
}
function warn_green(t,msg){
	$(document).ready(function () {
		$.growl.notice({
			title: t,
			message: msg
		});
	});
}
function warn_yellow(t,msg){
	$(document).ready(function () {
		$.growl.warning({
			title: t,
			message: msg
		});
	});
}
function warn_gray(t,msg){
	$(document).ready(function () {
		$.growl({
			title: t,
			message: msg
		});
	});
}
function showBootstrapModal(id){
	$(document).ready(function () {
		$(id).modal('show');
	});
}
function hideBootstrapModal(id){
	$(document).ready(function () {
		$(id).modal('hide');
	});
}
function printAllParams(){
		console.log('version:'+gp_store.state.version);
		console.log('debug:'+gp_store.state.debug);
		console.log('pirate_killed:'+gp_store.state.pirate_killed);
		console.log('highest_card_zero:'+gp_store.state.highest_card_zero);
		console.log('robinson_adjust:'+gp_store.state.robinson_adjust);
		console.log('tired_adjust:'+gp_store.state.tired_adjust);
		console.log('each_card_plus:'+gp_store.state.each_card_plus);
		console.log('can_pick:'+gp_store.state.can_pick);
		console.log('running_diff:'+gp_store.state.running_diff);
		console.log('running_life:'+gp_store.state.running_life);
		console.log('running_phase:'+gp_store.state.running_phase);
		console.log('running_round:'+gp_store.state.running_round);
		console.log('lost_life:'+gp_store.state.lost_life);
		console.log('fight_adjust:'+gp_store.state.fight_adjust);
		console.log('phase_adjust:'+gp_store.state.phase_adjust);
		console.log('hazard:'+gp_store.state.hazard );
		console.log('special:'+gp_store.state.special);
		console.log('copyspecial:'+gp_store.state.copyspecial);
}