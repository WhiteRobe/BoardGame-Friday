// Diff Card x 4
var c_diffs = {
	c_diff01 : '以20点生命开局，同时从游戏中移除[衰老卡:"痴呆"(-5)];+10生命值/阶段;得分x1.0',
	c_diff02 : '在难度1的基础上加入一张衰老卡作为起始卡;+5生命值/阶段;得分x1.2',
	c_diff03 : '在难度2的基础上将[衰老卡:"痴呆"(-5)]移入游戏中并作为起始卡;+3生命值/阶段;得分x1.5',
	c_diff04 : '在难度3的基础上，以18点生命开局,技能损耗x(N+1.0);+1生命值/阶段;得分x2.0',
	c_diffmore : '...更高难度尚未开放...'
}

// Age Card x 12
var c_age01 = new AgeCard('衰老卡:痴呆',0,0,'./res/img/age.jpg',-3,2,undefined,0);
var c_age02 = new AgeCard('衰老卡:憔悴',1,0,'./res/img/age.jpg',-1,2,undefined,0);
var c_age03 = new AgeCard('衰老卡:受伤',2,0,'./res/img/age.jpg',-2,2,undefined,0);
var c_age04 = new AgeCard('衰老卡:懒惰',3,0,'./res/img/age.jpg',0,2,'Highest Card=0',0);

var c_age05 = new AgeCard('衰老卡:年老',0,1,'./res/img/age.jpg',-4,2,undefined,1);
var c_age06 = new AgeCard('衰老卡:惊吓',1,1,'./res/img/age.jpg',-2,2,undefined,0);
var c_age07 = new AgeCard('衰老卡:生病',2,1,'./res/img/age.jpg',-0,2,'-1 Life',0);
var c_age08 = new AgeCard('衰老卡:呕吐',3,1,'./res/img/age.jpg',-0,2,'Highest Card=0',0);

var c_age09 = new AgeCard('衰老卡:自虐',0,2,'./res/img/age.jpg',-5,2,undefined,1);
var c_age10 = new AgeCard('衰老卡:惊慌',1,2,'./res/img/age.jpg',-2,2,undefined,0);
var c_age11 = new AgeCard('衰老卡:重病',2,2,'./res/img/age.jpg',-0,2,'-2 Life',1);
var c_age12 = new AgeCard('衰老卡:无力',3,2,'./res/img/age.jpg',-0,2,'Stop',0);

// Robinson Card x 18
var c_robinson01 = new FightingCard('鲁滨逊卡:虚弱',0,0,'./res/img/robinson.jpg',-1,1,undefined);
var c_robinson02 = new FightingCard('鲁滨逊卡:饥饿',1,0,'./res/img/robinson.jpg',-1,1,undefined);
var c_robinson03 = new FightingCard('鲁滨逊卡:迟钝',2,0,'./res/img/robinson.jpg',0,1,undefined);
var c_robinson04 = new FightingCard('鲁滨逊卡:迟缓',3,0,'./res/img/robinson.jpg',0,1,undefined);
var c_robinson05 = new FightingCard('鲁滨逊卡:低落',4,0,'./res/img/robinson.jpg',0,1,undefined);
var c_robinson06 = new FightingCard('鲁滨逊卡:狡猾',5,0,'./res/img/robinson.jpg',1,1,undefined);

var c_robinson07 = new FightingCard('鲁滨逊卡:慌张',0,1,'./res/img/robinson.jpg',-1,1,undefined);
var c_robinson08 = new FightingCard('鲁滨逊卡:迷惑',1,1,'./res/img/robinson.jpg',-1,1,undefined);
var c_robinson09 = new FightingCard('鲁滨逊卡:好奇',2,1,'./res/img/robinson.jpg',0,1,undefined);
var c_robinson10 = new FightingCard('鲁滨逊卡:笨拙',3,1,'./res/img/robinson.jpg',0,1,undefined);
var c_robinson11 = new FightingCard('鲁滨逊卡:高兴',4,1,'./res/img/robinson.jpg',1,1,undefined);
var c_robinson12 = new FightingCard('鲁滨逊卡:饱腹',5,1,'./res/img/robinson.jpg',0,1,'+2 Life');

var c_robinson13 = new FightingCard('鲁滨逊卡:瞌睡',0,2,'./res/img/robinson.jpg',-1,1,undefined);
var c_robinson14 = new FightingCard('鲁滨逊卡:天真',1,2,'./res/img/robinson.jpg',0,1,undefined);
var c_robinson15 = new FightingCard('鲁滨逊卡:生疏',2,2,'./res/img/robinson.jpg',0,1,undefined);
var c_robinson16 = new FightingCard('鲁滨逊卡:呆滞',3,2,'./res/img/robinson.jpg',0,1,undefined);
var c_robinson17 = new FightingCard('鲁滨逊卡:英勇',4,2,'./res/img/robinson.jpg',1,1,undefined);
var c_robinson18 = new FightingCard('鲁滨逊卡:强壮',5,2,'./res/img/robinson.jpg',2,1,undefined);

// Pirate Card x 12 + expend x 3
var c_pirate01 = new PirateCard('海盗卡:巨人海盗',0,0,'./res/img/pirates.jpg',undefined,undefined,'Each Card Worth+1',10,50);
var c_pirate02 = new PirateCard('海盗卡:白袍海盗',1,0,'./res/img/pirates.jpg',undefined,undefined,'Power * 2 Of Lost Battles',8,'*');
var c_pirate03 = new PirateCard('海盗卡:强壮海盗',2,0,'./res/img/pirates.jpg',undefined,undefined,'Each Card Worth+1',7,23);
var c_pirate04 = new PirateCard('海盗卡:猎犬',3,0,'./res/img/pirates.jpg',undefined,undefined,'Fight Remain Hazard','*','*');

var c_pirate05 = new PirateCard('海盗卡:9个海盗',0,1,'./res/img/pirates.jpg',undefined,undefined,'Each Card Worth+1',10,35);
var c_pirate06 = new PirateCard('海盗卡:8个海盗',1,1,'./res/img/pirates.jpg',undefined,undefined,'Each Card Worth+1',8,27);
var c_pirate07 = new PirateCard('海盗卡:7个海盗',2,1,'./res/img/pirates.jpg',undefined,undefined,'Each Card Worth+1',6,19);
var c_pirate08 = new PirateCard('海盗卡:6个海盗',3,1,'./res/img/pirates.jpg',undefined,undefined,'Each Card Worth+1',5,15);

var c_pirate09 = new PirateCard('海盗卡:船长',0,2,'./res/img/pirates.jpg',undefined,undefined,'Each Card Worth+1',9,31);
var c_pirate10 = new PirateCard('海盗卡:恐怖海盗',1,2,'./res/img/pirates.jpg',undefined,undefined,'Only Half Battle Cards Counts',9,20);
var c_pirate11 = new PirateCard('海盗卡:弓箭手',2,2,'./res/img/pirates.jpg',undefined,undefined,'Each New Card Cost 2 Life',7,15);
var c_pirate12 = new PirateCard('海盗卡:剑士',3,2,'./res/img/pirates.jpg',undefined,undefined,'Power * 2 Of New Aging Card',5,'*');
// expend pirates
var c_pirate13 = new PirateCard('海盗卡:葛朗台',0,0,'./res/img/pirates2.jpg',undefined,undefined,'No Free Card',0,12);
var c_pirate14 = new PirateCard('海盗卡:反甲海盗',0,1,'./res/img/pirates2.jpg',undefined,undefined,'Thorns',10,17);
var c_pirate15 = new PirateCard('海盗卡:脓疱海盗',0,2,'./res/img/pirates2.jpg',undefined,undefined,'Poison 5',9,24);

// Hazard Card * 30
var c_hazard01 = new HazardCard('灾难/知识卡:蟒蛇',0,0,'./res/img/hazard.jpg',3,1,'Destory 1',4,{green:4,yellow:7,red:11});
var c_hazard02 = new HazardCard('灾难/知识卡:野熊',1,0,'./res/img/hazard.jpg',4,1,'Destory 1',5,{green:5,yellow:9,red:14});
var c_hazard03 = new HazardCard('灾难/知识卡:食人族',2,0,'./res/img/hazard.jpg',4,1,'Destory 1',5,{green:5,yellow:9,red:14});
var c_hazard04 = new HazardCard('灾难/知识卡:洞穴',3,0,'./res/img/hazard.jpg',0,1,'Place 1',1,{green:0,yellow:1,red:3});
var c_hazard05 = new HazardCard('灾难/知识卡:地震',4,0,'./res/img/hazard.jpg',2,1,'Exchange 1',3,{green:2,yellow:5,red:8});
var c_hazard06 = new HazardCard('灾难/知识卡:洪水',5,0,'./res/img/hazard.jpg',2,1,'Double 1',3,{green:2,yellow:5,red:8});

var c_hazard07 = new HazardCard('灾难/知识卡:白熊',0,1,'./res/img/hazard.jpg',3,1,'+1 Card',4,{green:4,yellow:7,red:11});
var c_hazard08 = new HazardCard('灾难/知识卡:野狼',1,1,'./res/img/hazard.jpg',3,1,'Vision',4,{green:4,yellow:7,red:11});
var c_hazard09 = new HazardCard('灾难/知识卡:美洲虎',2,1,'./res/img/hazard.jpg',3,1,'Exchange 1',4,{green:4,yellow:7,red:11});
var c_hazard10 = new HazardCard('灾难/知识卡:山崩',3,1,'./res/img/hazard.jpg',1,1,'+1 Life',2,{green:1,yellow:3,red:6});
var c_hazard11 = new HazardCard('灾难/知识卡:大雨',4,1,'./res/img/hazard.jpg',2,1,'Destory 1',2,{green:1,yellow:3,red:6});
var c_hazard12 = new HazardCard('灾难/知识卡:野猪',5,1,'./res/img/hazard.jpg',1,1,'Double 1',2,{green:1,yellow:3,red:6});

var c_hazard13 = new HazardCard('灾难/知识卡:雷雨',0,2,'./res/img/hazard.jpg',2,1,'+1 Card',3,{green:2,yellow:5,red:8});
var c_hazard14 = new HazardCard('灾难/知识卡:眼镜蛇',1,2,'./res/img/hazard.jpg',2,1,'Destory 1',3,{green:2,yellow:5,red:8});
var c_hazard15 = new HazardCard('灾难/知识卡:流沙',2,2,'./res/img/hazard.jpg',2,1,'Vision',3,{green:2,yellow:5,red:8});
var c_hazard16 = new HazardCard('灾难/知识卡:狼蜘',3,2,'./res/img/hazard.jpg',1,1,'+1 Life',2,{green:1,yellow:3,red:6});
var c_hazard17 = new HazardCard('灾难/知识卡:蜂巢',4,2,'./res/img/hazard.jpg',1,1,'Copy 1',2,{green:1,yellow:3,red:6});
var c_hazard18 = new HazardCard('灾难/知识卡:流感',5,2,'./res/img/hazard.jpg',2,1,'Destory 1',2,{green:1,yellow:3,red:6});
//----hazard2.jpg----//
var c_hazard19 = new HazardCard('灾难/知识卡:食人鱼',0,0,'./res/img/hazard2.jpg',1,1,'Place 1',2,{green:1,yellow:3,red:6});
var c_hazard20 = new HazardCard('灾难/知识卡:野马',1,0,'./res/img/hazard2.jpg',0,1,'Copy 1',1,{green:0,yellow:1,red:3});
var c_hazard21 = new HazardCard('灾难/知识卡:发烧',2,0,'./res/img/hazard2.jpg',0,1,'+2 Card',1,{green:0,yellow:1,red:3});
var c_hazard22 = new HazardCard('灾难/知识卡:溪流',3,0,'./res/img/hazard2.jpg',0,1,'+2 Card',1,{green:0,yellow:1,red:3});

var c_hazard23 = new HazardCard('灾难/知识卡:冰雹',0,1,'./res/img/hazard2.jpg',1,1,'Destory 1',2,{green:1,yellow:3,red:6});
var c_hazard24 = new HazardCard('灾难/知识卡:木筏',1,1,'./res/img/hazard2.jpg',0,1,'+1 Life',1,{green:0,yellow:1,red:3});
var c_hazard25 = new HazardCard('灾难/知识卡:岩石海岸',2,1,'./res/img/hazard2.jpg',0,1,'Phase -1',1,{green:0,yellow:1,red:3});
var c_hazard26 = new HazardCard('灾难/知识卡:饥馑',3,1,'./res/img/hazard2.jpg',0,1,'Destory 1',1,{green:0,yellow:1,red:3});

var c_hazard27 = new HazardCard('灾难/知识卡:飓风',0,2,'./res/img/hazard2.jpg',2,1,'+1 Life',3,{green:2,yellow:5,red:8});
var c_hazard28 = new HazardCard('灾难/知识卡:陡坡',1,2,'./res/img/hazard2.jpg',0,1,'+1 Life',1,{green:0,yellow:1,red:3});
var c_hazard29 = new HazardCard('灾难/知识卡:蚊虫',2,2,'./res/img/hazard2.jpg',0,1,'Exchange 2',1,{green:0,yellow:1,red:3});
var c_hazard30 = new HazardCard('灾难/知识卡:宝箱',3,2,'./res/img/hazard2.jpg',0,1,'Exchange 2',1,{green:0,yellow:1,red:3});

//  重置海盗的属性
function pirateRest(){
	c_pirate02 = new PirateCard('海盗卡:白袍海盗',1,0,'./res/img/pirates.jpg',undefined,undefined,'Power * 2 Of Last Battles',8,'*');
	c_pirate12 = new PirateCard('海盗卡:剑士',3,2,'./res/img/pirates.jpg',undefined,undefined,'Power * 2 Of New Aging Card',5,'*');
}