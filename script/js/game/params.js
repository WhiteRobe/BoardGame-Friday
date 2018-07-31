const card_width = 156;
const card_height = 241;
const pic_left_margin = 56;
const pic_top_margin = 48;
// 难度
const params_diff = {
	green : 1,
	yellow : 2,
	red : 3,
	orange : 4
};
// 血量
const params_life = 20;
// 进行的阶段
const params_phase = 1; // 1->2->3(->4:海盗)
// 游戏运行阶段
const params_round = 1; // 1:显示开始 2:显示选择难度 3:显示游戏界面

// 一般robinson卡片的样式
const default_card_board = {
	border:'2px solid #CCCCCC'
};
// 选中robinson卡片后的样式
const select_card_board = {
	border:'3px solid #663366'
};
// div默认样式
const spansize = {
	whiteSpace: 'nowrap',
	width:card_width,
	height:card_height,
	overflow:'hidden',
	display:'inline-block'
};

// 游戏内参数
// 全局参数管理仓库
const gp_store = new Vuex.Store({
	state:{
		version:'1.0.0 (7/27/2018)',
		server_address:'/score',//'#',// 服务器地址
		user_id:'Somebody', //用户的id,
		debug:false,//调试模式
		pirate_killed:0,
		skill_loss : 0, // 技能损耗
		highest_card_zero:false,// 是否最高战力卡战力为0
		robinson_adjust:1,//鲁滨逊战力值调整倍数
		tired_adjust:1, // 疲劳伤害加倍数
		each_card_plus:0, // 每张卡增加的战斗力点数
		thorns_injury:false, // 是否有荆棘伤害
		can_pick : true, // 是否可以抽战斗卡(回合战斗调整系数)
		running_diff : params_diff.green, // 游戏难度
		running_life : params_life, // 鲁滨逊生命值
		running_phase : params_phase, // 游戏阶段
		running_round : params_round, // 游戏控制round
		lost_life : undefined, // 上一回合损失的生命值
		fight_adjust : 0, // 战斗力加成调整系数(回合战斗调整系数)
		phase_adjust : 0, // 阶段加成调整系数(回合战斗调整系数)
		hazard : new HazardCard(), // 当前回合的灾难
		special : undefined, // 等待释放特技的卡牌
		copyspecial:undefined //复制技能卡
	},
	mutations:{
		setUserId : (state,s) => state.user_id=s,
		debug_onoff : (state) => state.debug=!state.debug,
		setSkillLoss : (state,n) => state.skill_loss = n,
		setThornsInjury : (state,b) => state.thorns_injury = b,
		incPirateKilled : (state,n) => state.pirate_killed += n,
		setCanPick : (state,b) => state.can_pick = b,
		incRound : (state,n) => state.running_round += n,
		setRound : (state,n) => state.running_round = n,
		incLife : (state,n) => {
			let maxLife = 30; // 不再是22点
			state.running_life += n;
			if(state.running_life>maxLife){
				state.running_life=maxLife;
				warn_yellow('吃的太撑','鲁滨逊的血量上限为'+maxLife+'!');
			}
		},
		setLife : (state,n) => state.running_life = n,
		setHighestCardZero : (state,b) => state.highest_card_zero = b,
		setRobinsonAdjust : (state,n) => state.robinson_adjust = n,
		setTiredAdjust : (state,n) => state.tired_adjust = n,
		setEachCardPlus : (state,n) => state.each_card_plus = n,
		//incLostLife : (state,n) => state.lost_life += n,
		setLostLife : (state,n) => state.lost_life = n,
		rstLostLife : (state) => state.lost_life = undefined,
		incPhase : (state,n) => {
			state.running_phase += n;
			if(state.running_phase>4){
				state.running_phase=4;// 阶段数上限为4
				warn_gray('系统错误','游戏阶段数最高为'+4+'!');
			}
			else if (state.running_phase<0){
				state.running_phase=0;// 阶段数下限为4
				warn_gray('系统错误','游戏阶段数最低为'+0+'!');
			}
		},
		setPhase : (state,n) => state.running_phase = n,
		incDiff : (state,n) => state.running_diff += n,
		setDiff : (state,n) => state.running_diff = n,
		setHazard : (state,h) => state.hazard = h,
		setSpecial : (state,s) => state.special = s,
		rstSpecial : (state) => state.special = undefined,
		rstCopySpecial : (state) => state.copyspecial = undefined,
		setCopySpecial : (state,s) => state.copyspecial = s,
		setPhaseAdjust : (state,n) => state.phase_adjust = n,
		incFightAdjust : (state,n) => state.fight_adjust += n,
		setFightAdjust : (state,n) => state.fight_adjust = n,
		rst(state){
			state.skill_loss=0;
			state.pirate_killed = 0;
			state.highest_card_zero = false;
			state.robinson_adjust =1;
			state.tired_adjust= 1;
			state.each_card_plus = 0;
			state.thorns_injury = false;
			state.can_pick = true;
			state.running_diff=params_diff.green;
			state.running_life=params_life;
			state.running_phase=params_phase;
			state.running_round=params_round;
			state.lost_life = undefined;
			state.fight_adjust = 0;
			state.phase_adjust = 0;
			state.hazard = new HazardCard();
			state.special = undefined;
			state.copyspecial = undefined;
		},
		rstRoundAdjust(state){ // 重设回合战斗调整系数
			state.highest_card_zero =false;
			state.robinson_adjust =1;
			state.tired_adjust = 1;
			state.each_card_plus = 0;
			state.can_pick = true;
			state.thorns_injury = false;
			//state.lost_life = undefined;
			state.phase_adjust = 0;
			state.fight_adjust = 0;
			state.special = undefined;
			state.copyspecial = undefined;
		}
	}
})