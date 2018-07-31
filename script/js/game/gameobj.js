// 父类-卡牌抽象类
function GameCard(c_name,x,y,url){
	var cardName = c_name || '卡牌名';
	var cardUrl = url || './res/img/back.jpg';
	var cardX = x || 0;
	var cardY = y || 0;
	var isDestory = false; // 卡牌是否移除 abandon:原设计的是卡牌属性可变，但被pika否决了
	var isExposed = false; // 卡牌是否被翻面 abandon
	this.setName = function(card_name){
		cardName = card_name;
	}
	this.getName = function(){
		return cardName;
	}
	this.setUrl = function(card_url){
		cardUrl = card_url;
	}
	this.getUrl = function(){
		return cardUrl;
	}
	this.setX = function(card_X){
		cardX = card_X;
	}
	this.getX = function(){
		return cardX;
	}
	this.setY = function(card_Y){
		cardY = card_Y;
	}
	this.getY = function(){
		return cardY;
	}
	this.destoryCard = function(){ //abandon
		isDestory = true;
	}
	this.isCardDestoryed = function(){ //abandon
		return isDestory;
	}
	this.exposeCard = function(){ //abandon
		isDestory = true;
	}
	this.isCardExposed = function(){ //abandon
		return isExposed;
	}
}

// 子类一代-战斗卡
// CPHIOKYA大佬说这里也有点设计失误
function FightingCard(c_name,x,y,url,c_value,c_destory,c_special){
	GameCard.call(this,c_name,x,y,url);
	var cardValue = c_value || 0;
	var cardDestoryValue = c_destory || 0;
	var cardSpecial = c_special || 'None';
	this.setCardValue = function(card_value){
		cardValue = card_value;
	}
	this.getCardValue = function(){
		return cardValue;
	}
	this.setDestroyValue = function(card_destroy_value){
		cardDestoryValue = card_destroy_value;
	}
	this.getDestoryValue = function(){
		return cardDestoryValue;
	}
	this.setCardSpecial = function(card_special){
		cardSpecial = card_special;
	}
	this.getCardSpecial = function(){
		return cardSpecial;
	}
}
FightingCard.prototype = Object.create(GameCard.prototype);
FightingCard.prototype.constructor = FightingCard;

// 子类二代-年龄卡-父亲[战斗卡]
function AgeCard(c_name,x,y,url,c_value,c_destory,c_special,c_hard){
	FightingCard.call(this,c_name,x,y,url,c_value,c_destory,c_special);
	var ageCardHard = c_hard || 0; // type 0 or 1
	this.setAgeCardHard = function(c_hard){
		ageCardHard = c_hard;
	}
	this.getAgeCardHard = function(){
		return ageCardHard;
	}
}
AgeCard.prototype = Object.create(FightingCard.prototype);
AgeCard.prototype.constructor = AgeCard;


// 子类二代-海盗卡-父亲[战斗卡]
function PirateCard(c_name,x,y,url,c_value,c_destory,c_special,c_free,card_hard_to_beat){
	FightingCard.call(this,c_name,x,y,url,c_value,c_destory,c_special);
	var freeCard = c_free || 0;
	this.hardToBeat = card_hard_to_beat || 0;
	this.setFreeCard = function(free_card){
		freeCard = free_card;
	}
	this.getFreeCard = function(){
		return freeCard;
	}
	this.setHardToBeat = function(card_hard_to_beat){
		this.hardToBeat = card_hard_to_beat;
	}
	/*
	// 该方法可被子类重写
	this.getHardToBeat = function(){
		return hardToBeat;
	}*/
}
PirateCard.prototype = Object.create(FightingCard.prototype);
PirateCard.prototype.constructor = PirateCard;
PirateCard.prototype.getHardToBeat = function(){
	return this.hardToBeat;
}

// 子类三代-灾难/知识卡-父亲[海盗卡]
function HazardCard(c_name,x,y,url,c_value,c_destory,c_special,c_free,card_hard_to_beat){
	PirateCard.call(this,c_name,x,y,url,c_value,c_destory,c_special,c_free,card_hard_to_beat || {
		green:0,
		yellow:0,
		red:0
	});
	var isKnown = false;
	this.knowCard = function(){
		isKnown = true;
	}
	this.isCardKnown = function(){
		return isKnown;
	}
}
HazardCard.prototype = Object.create(PirateCard.prototype);
HazardCard.prototype.constructor = HazardCard;
HazardCard.prototype.getHardToBeat = function(phase_level){
	if(phase_level==1) return this.hardToBeat.green;
	else if(phase_level==2) return this.hardToBeat.yellow;
	else return this.hardToBeat.red; // 其他阶段都返回最高的战力值
}

// 卡牌叠
function CardDeck(){
	var deck = new Array();
	
	this.randomsort = function(a,b){
		return Math.random()>0.5 ? -1 : 1;
	}
	this.insertCard = function(card){ // 头部插入
		if(card==undefined)console.log('Error:Undefined Card Inserted!');
		else deck.unshift(card);
	}
	this.addCard = function(card){ // 末尾添加
		if(card==undefined)console.log('Error:Undefined Card Added!');
		else deck.push(card);
	}
	this.addCardTo = function(index,card){
		deck.splice(index,0,card);
	}
	this.removeCard = function(card){ // 无状态移除
		for(var i=0;i<deck.length;i++){
			if(deck[i]==card){
				deck.splice(i,1);
			}
		}
	}
	this.replaceCard = function(c_old,c_new){
		var index = this.findCard(c_old);
		deck.splice(index,1,c_new);
	}
	this.findCard = function(card){
		for(var i=0;i<deck.length;i++){
			if(deck[i]==card) return i;
		}
		return -1;
	}
	this.switchCard = function(fr,to){
		var temp = deck[to];
		deck.splice(to,1,deck[fr]);
		deck.splice(fr,1,temp);
	}
	this.popCard = function(){
		var c = deck[0];
		this.removeCard(c);
		return c;
	}
	this.cleanDeck = function(){
		deck.splice(0,deck.length);
	}
	this.getDeck = function(){
		return deck;
	}
	this.shuffle = function(){
		deck.sort(this.randomsort);
	}
	this.getValueSum = function(){
		var total = 0;
		for(var i=0;i<deck.length;i++){
			total += deck[i].getCardValue();
		}
		return total;
	}
	this.getDestoryValueSum = function(){
		var total = 0;
		for(var i=0;i<deck.length;i++){
			total += deck[i].getDestoryValue();
		}
		return total;
	}
	this.moveTo = function(targetDeck){
		this.copyTo(targetDeck);
		this.cleanDeck();
		//targetDeck.shuffle();
	}
	this.copyTo = function(targetDeck){
		for(var i=0;i<deck.length;i++){
			targetDeck.addCard(deck[i]);
		}
	}
	this.contain = function(card){
		for(var i=0;i<deck.length;i++){
			if(deck[i]==card)return true;
		}
		return false;
	}
	this.firstCard = function(){
		return deck[0];
	}
	this.lastCard = function(){
		return deck[deck.length-1];
	}
	this.cardAt = function(index){
		return deck[index];
	}
	this.size = function(){
		return deck.length;
	}
	this.countTypeClassSum = function(cls){
		var total = 0;
		for(var i=0;i<deck.length;i++){
			if(deck[i] instanceof cls)total++;
		}
		return total;
	}
	this.filter = function(func){
		var n_deck = new CardDeck();
		for(var i=0;i<deck.length;i++){
			if(func(deck[i])){
				n_deck.addCard(deck[i]);
			}
		}
		return n_deck;
	}
	this.empty = function(){
		return deck.length==0;
	}
	this.maxCardValue = function(){
		let max = -1000000000;
		for(var i=0;i<deck.length;i++){
			if(deck[i].getCardValue()>max) max = deck[i].getCardValue();
		}
		return max;
	}
	this.minCardValue = function(){
		let min = 1000000000;
		for(var i=0;i<deck.length;i++){
			if(deck[i].getCardValue()<min) min = deck[i].getCardValue();
		}
		return min;
	}
	this.printAllCard = function(){
		for(var i=0;i<deck.length;i++){
			console.log(deck[i].getName());
		}
	}
}