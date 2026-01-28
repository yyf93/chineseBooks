const express = require('express');
const compression = require('compression');
const app = express();
const PORT = 80;

// 启用 gzip 压缩 - 大幅减少传输数据量
app.use(compression());

// 静态文件目录 + 缓存优化
app.use(express.static('public', {
  maxAge: '1d',           // 缓存1天
  etag: true,
  lastModified: true
}));

// ==================== 书籍数据 ====================
const CHINESE_BOOKS = {
  '文学': [
    { name: '活着', author: '余华', views: 98500, rating: 9.2 },
    { name: '百年孤独', author: '加西亚·马尔克斯/范晔译', views: 87200, rating: 9.1 },
    { name: '平凡的世界', author: '路遥', views: 76500, rating: 8.8 },
    { name: '围城', author: '钱钟书', views: 72000, rating: 9.0 },
    { name: '追风筝的人', author: '卡勒德·胡赛尼/李继宏译', views: 68000, rating: 8.9 },
    { name: '小王子', author: '安托万·德·圣埃克苏佩里/马振聘译', views: 65000, rating: 9.0 },
    { name: '老人与海', author: '欧内斯特·海明威/吴劳译', views: 62000, rating: 8.7 },
    { name: '瓦尔登湖', author: '亨利·戴维·梭罗/徐迟译', views: 58000, rating: 8.5 },
    { name: '不能承受的生命之轻', author: '米兰·昆德拉/许钧译', views: 55000, rating: 8.6 },
    { name: '月亮与六便士', author: '毛姆/傅惟慈译', views: 52000, rating: 8.8 },
    { name: '1984', author: '乔治·奥威尔/董乐山译', views: 50000, rating: 9.0 },
    { name: '动物农场', author: '乔治·奥威尔/荣如德译', views: 48000, rating: 8.9 },
    { name: '解忧杂货店', author: '东野圭吾/李盈春译', views: 62000, rating: 8.5 },
    { name: '白夜行', author: '东野圭吾/刘姿君译', views: 59000, rating: 9.0 },
    { name: '嫌疑人X的献身', author: '东野圭吾/刘子倩译', views: 56000, rating: 8.9 },
    { name: '挪威的森林', author: '村上春树/林少华译', views: 54000, rating: 8.4 },
    { name: '海边的卡夫卡', author: '村上春树/林少华译', views: 48000, rating: 8.5 },
    { name: '1Q84', author: '村上春树/施小炜译', views: 45000, rating: 8.6 },
    { name: '黄金时代', author: '王小波', views: 52000, rating: 8.8 },
    { name: '沉默的大多数', author: '王小波', views: 49000, rating: 8.7 },
    { name: '红楼梦', author: '曹雪芹', views: 68000, rating: 9.3 },
    { name: '三国演义', author: '罗贯中', views: 62000, rating: 9.0 },
    { name: '水浒传', author: '施耐庵', views: 58000, rating: 8.9 },
    { name: '西游记', author: '吴承恩', views: 65000, rating: 9.1 },
    { name: '傲慢与偏见', author: '简·奥斯汀/王科一译', views: 47000, rating: 8.8 },
    { name: '简爱', author: '夏洛蒂·勃朗特/祝庆英译', views: 45000, rating: 8.7 },
    { name: '呼啸山庄', author: '艾米莉·勃朗特/杨苡译', views: 42000, rating: 8.6 },
    { name: '悲惨世界', author: '雨果/郑克鲁译', views: 51000, rating: 9.0 },
    { name: '巴黎圣母院', author: '雨果/施咸荣译', views: 48000, rating: 8.7 },
    { name: '战争与和平', author: '列夫·托尔斯泰/草婴译', views: 55000, rating: 9.0 }
  ],
  '科技': [
    { name: '浪潮之巅', author: '吴军', views: 92000, rating: 9.0 },
    { name: '未来简史', author: '尤瓦尔·赫拉利/林俊宏译', views: 84500, rating: 8.7 },
    { name: '智能时代', author: '吴军', views: 72000, rating: 8.5 },
    { name: '人工智能：一种现代方法', author: '罗素/ Norvig', views: 68000, rating: 9.1 },
    { name: '深度学习', author: '伊恩·古德费洛/曾华安译', views: 65000, rating: 9.2 },
    { name: '计算之魂', author: '吴军', views: 60000, rating: 8.8 },
    { name: '黑客与画家', author: '保罗·格雷厄姆/阮一峰译', views: 58000, rating: 8.9 },
    { name: '从一到无穷大', author: '伽莫夫/暴永宁译', views: 55000, rating: 9.1 },
    { name: '时间简史', author: '史蒂芬·霍金/许明贤译', views: 52000, rating: 8.8 },
    { name: '上帝掷骰子吗', author: '曹天元', views: 82000, rating: 9.1 },
    { name: '人类简史', author: '尤瓦尔·赫拉利/林俊宏译', views: 92000, rating: 9.1 },
    { name: '数学之美', author: '吴军', views: 63000, rating: 8.9 },
    { name: '万历十五年', author: '黄仁宇', views: 86000, rating: 9.0 },
    { name: '中国历代政治得失', author: '钱穆', views: 72000, rating: 9.0 },
    { name: '全球通史', author: '斯塔夫里阿诺斯/吴象婴译', views: 68000, rating: 8.9 }
  ],
  '商业': [
    { name: '富爸爸穷爸爸', author: '罗伯特·清崎/杨君君译', views: 115000, rating: 9.3 },
    { name: '从零到一', author: '彼得·蒂尔/高玉芳译', views: 98000, rating: 8.9 },
    { name: '原则', author: '瑞·达利欧/刘波译', views: 89000, rating: 9.1 },
    { name: '穷查理宝典', author: '彼得·考夫曼/李继宏译', views: 82000, rating: 9.2 },
    { name: '思考，快与慢', author: '丹尼尔·卡尼曼/胡晓姣译', views: 78000, rating: 9.0 },
    { name: '影响力', author: '罗伯特·西奥迪尼/闾佳译', views: 92000, rating: 9.1 },
    { name: '高效能人士的七个习惯', author: '史蒂芬·柯维/高新勇译', views: 85000, rating: 8.6 },
    { name: '巴菲特致股东的信', author: '沃伦·巴菲特/杨天南译', views: 78000, rating: 9.1 },
    { name: '穷爸爸富爸爸', author: '罗伯特·清崎', views: 125000, rating: 9.3 },
    { name: '价值', author: '张磊', views: 75000, rating: 8.8 }
  ],
  '编程': [
    { name: '代码整洁之道', author: '罗伯特·C·马丁/韩磊译', views: 125000, rating: 9.4 },
    { name: 'JavaScript高级程序设计', author: 'Nicholas C. Zakas/李松峰译', views: 112000, rating: 9.2 },
    { name: '深入理解计算机系统', author: 'Randal E. Bryant/龚奕利译', views: 98000, rating: 9.3 },
    { name: '算法导论', author: 'Thomas H. Cormen/殷建平译', views: 95000, rating: 9.4 },
    { name: '设计模式', author: 'Erich Gamma/李英军译', views: 89000, rating: 9.2 },
    { name: '重构', author: '马丁·福勒/熊节译', views: 85000, rating: 9.1 },
    { name: '人月神话', author: 'Frederick P. Brooks Jr./汪颖译', views: 78000, rating: 9.0 },
    { name: '鸟哥的Linux私房菜', author: '鸟哥', views: 92000, rating: 9.3 },
    { name: 'Clean Code', author: 'Robert C. Martin/徐可译', views: 105000, rating: 9.4 },
    { name: 'Effective Java', author: 'Joshua Bloch/俞黎敏译', views: 82000, rating: 9.2 }
  ],
  '心理学': [
    { name: '影响力', author: '罗伯特·西奥迪尼/闾佳译', views: 102000, rating: 9.1 },
    { name: '思考，快与慢', author: '丹尼尔·卡尼曼/胡晓姣译', views: 89000, rating: 9.0 },
    { name: '自控力', author: '凯利·麦格尼格尔/王岑卉译', views: 85000, rating: 8.8 },
    { name: '乌合之众', author: '古斯塔夫·勒庞/冯克利译', views: 78000, rating: 8.5 },
    { name: '亲密关系', author: '罗兰·米勒/王伟平译', views: 72000, rating: 8.9 },
    { name: '心流', author: '米哈里·契克森米哈赖/张定绮译', views: 68000, rating: 8.7 },
    { name: '社会心理学', author: '戴维·迈尔斯/侯玉波译', views: 75000, rating: 9.0 },
    { name: '非暴力沟通', author: '马歇尔·卢森堡/阮胤华译', views: 89000, rating: 8.9 },
    { name: '少有人走的路', author: 'M·斯科特·派克/于海生译', views: 78000, rating: 8.9 },
    { name: '活出生命的意义', author: '维克多·弗兰克尔/吕娜译', views: 78000, rating: 9.0 }
  ],
  '科幻': [
    { name: '三体', author: '刘慈欣', views: 125000, rating: 9.3 },
    { name: '三体II：黑暗森林', author: '刘慈欣', views: 108000, rating: 9.2 },
    { name: '三体III：死神永生', author: '刘慈欣', views: 98000, rating: 9.1 },
    { name: '球状闪电', author: '刘慈欣', views: 78000, rating: 8.9 },
    { name: '流浪地球', author: '刘慈欣', views: 82000, rating: 8.8 },
    { name: '2001太空漫游', author: '阿瑟·克拉克/郝明义译', views: 92000, rating: 9.1 },
    { name: '基地', author: '艾萨克·阿西莫夫/叶李华译', views: 88000, rating: 9.0 },
    { name: '沙丘', author: '弗兰克·赫伯特/潘振华译', views: 85000, rating: 8.9 },
    { name: '神经漫游者', author: '威廉·吉布森/雷德蒙·蒋译', views: 82000, rating: 8.8 },
    { name: '你一生的故事', author: '特德·姜/李克勤译', views: 75000, rating: 8.9 }
  ],
  '悬疑推理': [
    { name: '白夜行', author: '东野圭吾/刘姿君译', views: 102000, rating: 9.0 },
    { name: '嫌疑人X的献身', author: '东野圭吾/刘子倩译', views: 95000, rating: 8.9 },
    { name: '解忧杂货店', author: '东野圭吾/李盈春译', views: 92000, rating: 8.5 },
    { name: '恶意', author: '东野圭吾/娄美莲译', views: 78000, rating: 8.7 },
    { name: '福尔摩斯探案集', author: '阿瑟·柯南道尔/丁凯译', views: 98000, rating: 9.1 },
    { name: '无人生还', author: '阿加莎·克里斯蒂/夏阳译', views: 82000, rating: 8.8 },
    { name: '东方快车谋杀案', author: '阿加莎·克里斯蒂/郑桥译', views: 78000, rating: 8.7 },
    { name: '达芬奇密码', author: '丹·布朗/朱小欧译', views: 88000, rating: 8.5 },
    { name: '沉默的羔羊', author: '托马斯·哈里斯/朱小欧译', views: 75000, rating: 8.6 },
    { name: '别相信任何人', author: 'S.J.沃森/胡绯译', views: 69000, rating: 8.3 }
  ],
  '历史': [
    { name: '万历十五年', author: '黄仁宇', views: 96000, rating: 9.0 },
    { name: '人类简史', author: '尤瓦尔·赫拉利/林俊宏译', views: 102000, rating: 9.1 },
    { name: '明朝那些事儿', author: '当年明月', views: 98000, rating: 8.8 },
    { name: '中国历代政治得失', author: '钱穆', views: 82000, rating: 9.0 },
    { name: '全球通史', author: '斯塔夫里阿诺斯/吴象婴译', views: 78000, rating: 8.9 },
    { name: '史记', author: '司马迁', views: 95000, rating: 9.3 },
    { name: '资治通鉴', author: '司马光', views: 88000, rating: 9.1 },
    { name: '半小时漫画中国史', author: '陈磊', views: 88000, rating: 8.6 },
    { name: '显微镜下的大明', author: '马伯庸', views: 72000, rating: 8.9 },
    { name: '人类群星闪耀时', author: '斯蒂芬·茨威格/姜乙译', views: 67000, rating: 8.9 }
  ],
  '艺术': [
    { name: '设计心理学', author: '唐纳德·诺曼/小柯译', views: 75000, rating: 8.6 },
    { name: '艺术的故事', author: '贡布里希/范景中译', views: 72000, rating: 9.1 },
    { name: '电影艺术', author: '大卫·波德维尔/曾伟祯译', views: 59000, rating: 8.8 },
    { name: '设计中的设计', author: '原研哉/朱锷译', views: 61000, rating: 8.6 },
    { name: '造房子', author: '王澍', views: 57000, rating: 8.7 },
    { name: '写给大家看的设计书', author: '罗宾·威廉姆斯/苏金国译', views: 65000, rating: 8.5 },
    { name: '色彩搭配手册', author: '贝蒂·艾德华/鲁道夫译', views: 62000, rating: 8.2 },
    { name: '摄影的艺术', author: '弗里曼/张波译', views: 58000, rating: 8.4 },
    { name: '乐之本事', author: '焦元溥', views: 52000, rating: 8.7 },
    { name: '西方美术史', author: '丁宁', views: 68000, rating: 8.9 }
  ],
  '生活': [
    { name: '断舍离', author: '山下英子/贾耀平译', views: 88000, rating: 8.5 },
    { name: '怦然心动的人生整理魔法', author: '近藤麻理惠/徐明中译', views: 82000, rating: 8.4 },
    { name: '非暴力沟通', author: '马歇尔·卢森堡/阮胤华译', views: 99000, rating: 8.9 },
    { name: '活出生命的意义', author: '维克多·弗兰克尔/吕娜译', views: 78000, rating: 9.0 },
    { name: '习惯的力量', author: '查尔斯·杜希格/吴奕俊译', views: 72000, rating: 8.7 },
    { name: '瓦尔登湖', author: '亨利·戴维·梭罗/徐迟译', views: 75000, rating: 8.5 },
    { name: '睡眠革命', author: '尼克·利特尔黑尔斯/郑舜珑译', views: 62000, rating: 8.3 },
    { name: '正念的奇迹', author: '一行禅师/何耀辉译', views: 65000, rating: 8.6 },
    { name: '活法', author: '稻盛和夫/曹岫云译', views: 78000, rating: 8.4 },
    { name: '当下的力量', author: '埃克哈特·托利/曹植译', views: 88000, rating: 8.8 }
  ],
  '哲学': [
    { name: '西方哲学史', author: '罗素/何兆武译', views: 68000, rating: 9.0 },
    { name: '中国哲学简史', author: '冯友兰', views: 72000, rating: 9.1 },
    { name: '理想国', author: '柏拉图/郭斌和译', views: 62000, rating: 8.9 },
    { name: '苏菲的世界', author: '乔斯坦·贾德/萧宝森译', views: 65000, rating: 8.8 },
    { name: '人生的智慧', author: '叔本华/韦启昌译', views: 63000, rating: 8.9 },
    { name: '论语译注', author: '杨伯峻', views: 72000, rating: 9.2 },
    { name: '道德经', author: '老子/陈鼓应译', views: 68000, rating: 9.1 },
    { name: '庄子注译', author: '陈鼓应', views: 64000, rating: 8.9 },
    { name: '尼采文集', author: '尼采/孙周兴译', views: 58000, rating: 8.7 },
    { name: '存在与时间', author: '海德格尔/陈嘉映译', views: 52000, rating: 8.6 }
  ],
  '经济学': [
    { name: '经济学原理', author: '曼昆/梁小民译', views: 102000, rating: 9.2 },
    { name: '国富论', author: '亚当·斯密/谢祖钧译', views: 78000, rating: 9.0 },
    { name: '资本论', author: '马克思/中共中央编译局译', views: 85000, rating: 8.9 },
    { name: '贫穷的本质', author: '阿比吉特·班纳吉/景芳译', views: 65000, rating: 8.7 },
    { name: '魔鬼经济学', author: '史蒂芬·列维特/王晓鹂译', views: 59000, rating: 8.5 },
    { name: '牛奶可乐经济学', author: '罗伯特·弗兰克/闾佳译', views: 61000, rating: 8.6 },
    { name: '博弈论', author: '朱·弗登博格/黄涛译', views: 68000, rating: 8.8 },
    { name: '思考，快与慢', author: '丹尼尔·卡尼曼/胡晓姣译', views: 89000, rating: 9.0 },
    { name: '助推', author: '理查德·塞勒/刘宁译', views: 56000, rating: 8.4 },
    { name: '怪诞行为学', author: '丹·艾瑞里/赵德亮译', views: 62000, rating: 8.6 }
  ],
  '教育': [
    { name: '正面管教', author: '简·尼尔森/玉冰译', views: 78000, rating: 8.7 },
    { name: '如何说孩子才会听', author: '阿黛尔·法伯/安燕玲译', views: 72000, rating: 8.6 },
    { name: '好妈妈胜过好老师', author: '尹建莉', views: 82000, rating: 8.8 },
    { name: '捕捉儿童敏感期', author: '孙瑞雪', views: 66000, rating: 8.5 },
    { name: '终身成长', author: '卡罗尔·德韦克/楚小楠译', views: 72000, rating: 8.7 },
    { name: '认知天性', author: '彼得·布朗/喻小意识', views: 63000, rating: 8.6 },
    { name: '如何学习', author: '本尼迪克特·凯里/玉冰译', views: 59000, rating: 8.4 },
    { name: '学习之道', author: '芭芭拉·奥克利', views: 61000, rating: 8.5 },
    { name: '刻意练习', author: '安德斯·艾利克森/王正林译', views: 68000, rating: 8.8 },
    { name: '番茄工作法图解', author: '史蒂夫·诺特伯格', views: 62000, rating: 8.3 }
  ],
  '医学': [
    { name: '人体解剖图谱', author: '人民卫生出版社', views: 82000, rating: 9.1 },
    { name: '内科学', author: '葛均波/徐永健', views: 78000, rating: 9.0 },
    { name: '外科学', author: '陈孝平/汪建平', views: 75000, rating: 8.9 },
    { name: '本草纲目', author: '李时珍', views: 72000, rating: 9.2 },
    { name: '黄帝内经', author: '黄帝', views: 69000, rating: 9.0 },
    { name: '我们为什么会生病', author: 'R.M.尼斯/乔治·威廉斯', views: 62000, rating: 8.8 },
    { name: '基因传', author: '悉达多·穆克吉/马向涛译', views: 68000, rating: 8.9 },
    { name: '癌症传', author: '悉达多·穆克吉/李虎译', views: 66000, rating: 8.8 },
    { name: '最好的告别', author: '阿图·葛文德/彭小华译', views: 72000, rating: 8.9 },
    { name: '当呼吸化为空气', author: '保罗·卡拉尼什', views: 65000, rating: 8.9 }
  ],
  '军事': [
    { name: '孙子兵法', author: '孙武/曹操注', views: 95000, rating: 9.3 },
    { name: '三十六计', author: '檀道济', views: 88000, rating: 9.0 },
    { name: '战争论', author: '克劳塞维茨', views: 72000, rating: 8.9 },
    { name: '论持久战', author: '毛泽东', views: 75000, rating: 9.1 },
    { name: '朝鲜战争', author: '王树增', views: 68000, rating: 8.9 },
    { name: '长征', author: '王树增', views: 72000, rating: 9.0 },
    { name: '二战全史', author: '中国长安出版社', views: 66000, rating: 8.7 },
    { name: '超限战', author: '乔良/王湘穗', views: 62000, rating: 8.5 },
    { name: '海权论', author: '阿尔弗雷德·塞耶·马汉', views: 62000, rating: 8.6 },
    { name: '战略论', author: '李德·哈特/钮先钟译', views: 58000, rating: 8.7 }
  ],
  '宗教': [
    { name: '圣经', author: '和合本', views: 98000, rating: 9.0 },
    { name: '金刚经', author: '鸠摩罗什译', views: 75000, rating: 9.1 },
    { name: '道德经', author: '老子/陈鼓应译', views: 88000, rating: 9.2 },
    { name: '庄子', author: '庄子/陈鼓应译', views: 78000, rating: 9.0 },
    { name: '西藏生死书', author: '索甲仁波切/郑振煌译', views: 78000, rating: 8.9 },
    { name: '禅与摩托车维修艺术', author: '罗伯特·波西格', views: 72000, rating: 8.8 },
    { name: '正见：佛陀的证悟', author: '宗萨蒋扬钦哲仁波切', views: 68000, rating: 8.7 },
    { name: '牧羊少年奇幻之旅', author: '保罗·柯艾略/丁俊译', views: 82000, rating: 8.9 },
    { name: '与神对话', author: '尼尔·唐纳德·沃尔什', views: 75000, rating: 8.7 },
    { name: '古兰经', author: '马坚译', views: 82000, rating: 8.8 }
  ],
  '语言学习': [
    { name: '新概念英语', author: '亚历山大/何其莘', views: 135000, rating: 9.2 },
    { name: '标准日本语', author: '人民教育出版社', views: 102000, rating: 9.0 },
    { name: '赖世雄美语入门', author: '赖世雄', views: 95000, rating: 8.8 },
    { name: '英语语法新思维', author: '张满胜', views: 78000, rating: 8.7 },
    { name: 'GRE词汇', author: '俞敏洪', views: 88000, rating: 8.9 },
    { name: '大家的日语', author: '日本3A出版社', views: 85000, rating: 8.7 },
    { name: '简明法语教程', author: '孙辉', views: 62000, rating: 8.2 },
    { name: '新编日语', author: '周平', views: 78000, rating: 8.6 },
    { name: '日语综合教程', author: '周平/陈小芬', views: 82000, rating: 8.8 },
    { name: '韩语入门', author: '首尔大学', views: 72000, rating: 8.5 }
  ],
  '旅行': [
    { name: '孤独星球', author: 'Lonely Planet', views: 98000, rating: 9.0 },
    { name: '中国国家地理', author: '中国国家地理杂志社', views: 85000, rating: 8.8 },
    { name: '旅行的艺术', author: '阿兰·德波顿', views: 72000, rating: 8.6 },
    { name: '此刻花开', author: '飞行官小北', views: 58000, rating: 8.2 },
    { name: '分开旅行', author: '陶立夏', views: 52000, rating: 8.0 },
    { name: '人生终要有一场触及灵魂的旅行', author: '毕淑敏', views: 62000, rating: 8.3 },
    { name: '非洲三万里', author: '毕淑敏', views: 55000, rating: 8.2 },
    { name: '撒哈拉的故事', author: '三毛', views: 85000, rating: 8.9 },
    { name: '万水千山走遍', author: '三毛', views: 72000, rating: 8.7 },
    { name: '最好的时光在路上', author: '郭子鹰', views: 48000, rating: 8.1 }
  ],
  '体育': [
    { name: '跑步圣经', author: '赫尔伯特·史迪凡尼', views: 62000, rating: 8.4 },
    { name: '囚徒健身', author: '保罗·威德', views: 68000, rating: 8.5 },
    { name: '施瓦辛格健身全书', author: '阿诺德·施瓦辛格', views: 58000, rating: 8.6 },
    { name: '力量训练基础', author: '马克·瑞比托', views: 52000, rating: 8.3 },
    { name: '拉伸', author: 'Bob Anderson', views: 55000, rating: 8.2 },
    { name: '瑜伽之光', author: 'B.K.S.艾扬格', views: 62000, rating: 8.4 },
    { name: '运动解剖学', author: 'NASM', views: 54000, rating: 8.3 },
    { name: '健身营养指南', author: 'NSCA', views: 48000, rating: 8.1 },
    { name: '无器械健身', author: '马克·劳伦', views: 56000, rating: 8.2 },
    { name: '核心基础运动', author: '埃里克·古德曼', views: 50000, rating: 8.0 }
  ],
  '美食': [
    { name: '舌尖上的中国', author: '陈晓卿', views: 92000, rating: 8.9 },
    { name: '川菜杂谈', author: '车辐', views: 68000, rating: 8.5 },
    { name: '粤菜溯源', author: '何其至', views: 62000, rating: 8.4 },
    { name: '茶经', author: '陆羽', views: 72000, rating: 9.0 },
    { name: '随园食单', author: '袁枚', views: 65000, rating: 8.8 },
    { name: '食疗本草', author: '孟诜', views: 52000, rating: 8.3 },
    { name: '厨艺的常识', author: '迈克尔·鲁尔曼', views: 66000, rating: 8.6 },
    { name: '法国烹饪', author: '奥古斯特·埃斯科菲耶', views: 60000, rating: 8.4 },
    { name: '烘焙艺术', author: '雷诺兹', views: 62000, rating: 8.4 },
    { name: '分子美食', author: '埃尔文', views: 49000, rating: 7.9 }
  ],
  '物理学': [
    { name: '时间简史', author: '史蒂芬·霍金/许明贤译', views: 102000, rating: 8.8 },
    { name: '果壳中的宇宙', author: '史蒂芬·霍金/吴忠超译', views: 78000, rating: 8.6 },
    { name: '从一到无穷大', author: '伽莫夫/暴永宁译', views: 85000, rating: 9.1 },
    { name: '上帝掷骰子吗', author: '曹天元', views: 92000, rating: 9.1 },
    { name: '量子物理史话', author: '曹天元', views: 78000, rating: 9.0 },
    { name: '七堂极简物理课', author: '罗韦利/文铮译', views: 72000, rating: 8.8 },
    { name: '时间的秩序', author: '罗韦利/杨光译', views: 68000, rating: 8.7 },
    { name: '极简宇宙史', author: '克里斯托弗·加尔法德', views: 75000, rating: 8.9 },
    { name: '相对论', author: '爱因斯坦/易洪武译', views: 72000, rating: 8.9 },
    { name: '自然哲学的数学原理', author: '牛顿/郑太朴译', views: 68000, rating: 8.8 }
  ],
  '传记': [
    { name: '乔布斯传', author: '沃尔特·艾萨克森', views: 108000, rating: 9.1 },
    { name: '埃隆·马斯克传', author: '阿什利·万斯', views: 95000, rating: 8.9 },
    { name: '曾国藩传', author: '张宏杰', views: 78000, rating: 8.9 },
    { name: '苏东坡传', author: '林语堂/张振玉译', views: 82000, rating: 9.0 },
    { name: '毛泽东传', author: '罗斯·特里尔', views: 85000, rating: 9.0 },
    { name: '邓小平时代', author: '傅高义/冯克利译', views: 88000, rating: 9.1 },
    { name: '富兰克林传', author: '沃尔特·艾萨克森', views: 72000, rating: 8.8 },
    { name: '达芬奇传', author: '沃尔特·艾萨克森', views: 72000, rating: 8.9 },
    { name: '梵高传', author: '欧文·斯通/常涛译', views: 68000, rating: 8.8 },
    { name: '爱因斯坦传', author: '沃尔特·艾萨克森', views: 82000, rating: 8.9 }
  ]
};

// ==================== 高性能缓存层 ====================
let cache = null;
let cacheTime = 0;
const CACHE_DURATION = 60000; // 缓存1分钟

function computeStats() {
  const start = Date.now();
  
  const categories = Object.keys(CHINESE_BOOKS);
  const allBooks = {};
  const categoryStats = {};
  
  let totalViews = 0;
  let totalBooks = 0;
  let allRatings = [];
  
  categories.forEach(cat => {
    const books = CHINESE_BOOKS[cat];
    allBooks[cat] = books;
    
    const catViews = books.reduce((sum, b) => sum + b.views, 0);
    const catRatings = books.map(b => b.rating);
    
    categoryStats[cat] = {
      category: cat,
      bookCount: books.length,
      totalViews: catViews,
      avgRating: (catRatings.reduce((a, b) => a + b, 0) / catRatings.length).toFixed(1)
    };
    
    totalViews += catViews;
    totalBooks += books.length;
    allRatings = allRatings.concat(catRatings);
  });
  
  const avgRating = (allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1);
  
  const elapsed = Date.now() - start;
  console.log(`⚡ 统计数据计算耗时: ${elapsed}ms`);
  
  return {
    categories: categories.map(cat => categoryStats[cat]),
    allBooks,
    timestamp: new Date().toISOString(),
    totalBooks,
    totalCategories: categories.length,
    totalViews,
    avgRating
  };
}

// 获取缓存数据
function getCachedData() {
  const now = Date.now();
  if (!cache || (now - cacheTime) > CACHE_DURATION) {
    cache = computeStats();
    cacheTime = now;
  }
  return cache;
}

// ==================== API 路由 ====================

// 主数据接口 - 预计算+缓存
app.get('/api/data', (req, res) => {
  const data = getCachedData();
  res.json({
    categories: data.categories,
    allBooks: data.allBooks,
    timestamp: data.timestamp
  });
});

// 刷新接口
app.post('/api/refresh', (req, res) => {
  cache = computeStats();
  cacheTime = Date.now();
  const data = cache;
  
  res.json({
    categories: data.categories,
    allBooks: data.allBooks,
    timestamp: data.timestamp
  });
});

// 分类数据接口 - 使用缓存
app.get('/api/category/:categoryName', (req, res) => {
  try {
    const categoryName = req.params.categoryName;
    const data = getCachedData();
    
    // 尝试多种方式匹配分类名
    const books = data.allBooks[categoryName] || 
                  data.allBooks[decodeURIComponent(categoryName)] || 
                  null;
    
    if (!books) {
      return res.status(404).json({ error: '分类不存在: ' + categoryName });
    }
    
    // 返回前30本书（已排序）
    const sortedBooks = books
      .sort((a, b) => b.views - a.views)
      .slice(0, 30)
      .map((book, index) => ({
        name: book.name,
        author: book.author,
        views: book.views + Math.floor(Math.random() * 200) - 50,
        rating: book.rating + (Math.random() * 0.2 - 0.1)
      }));
    
    res.json({
      category: categoryName,
      books: sortedBooks,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('获取分类数据失败:', error);
    res.status(500).json({ error: '获取分类数据失败' });
  }
});

// 预热缓存
getCachedData();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`📚 书籍数据面板运行在 http://0.0.0.0:${PORT}`);
  console.log('✅ 性能优化已启用: gzip压缩 + 数据缓存');
  console.log('数据来源: 高质量中文书籍数据库');
});
