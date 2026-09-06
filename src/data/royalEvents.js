// 《一朝天子》Prototype 0.3 皇室生命周期事件库 (Royal Events)

export const ROYAL_EVENTS = [
  {
    id: 'empress_pregnancy',
    type: 'royal',
    category: 'palace',
    priority: 85,
    title: '椒房有喜',
    newsTemplate: '【椒房有喜】太医具折奏闻，皇后体气和润已怀龙裔，六宫咸庆。',
    chronicleTemplate: '皇后有娠，中外称庆。',
    conditions: (world) => {
      const rf = world.royalFamily;
      return rf.empress && rf.empress.alive && !rf.empress.pregnant && rf.empress.age <= 42 && world.prng.next() < 0.18;
    },
    execute: (world) => {
      world.royalFamily.empress.pregnant = true;
      world.royalFamily.empress.pregnancyTurns = 0;
      return { headline: '椒房有喜', text: '太医奏报皇后有娠，后宫采办锦缎，群臣上笺称贺。' };
    }
  },
  {
    id: 'royal_birth_son',
    type: 'royal',
    category: 'palace',
    priority: 95,
    title: '龙凤呈祥 · 皇子降诞',
    newsTemplate: '【诞育麟儿】皇后诞下皇子，母子均安，御赐玉佩，宗社有托。',
    chronicleTemplate: '皇后诞皇子，天下大赦私债。',
    conditions: (world) => {
      const rf = world.royalFamily;
      return rf.empress && rf.empress.pregnant && rf.empress.pregnancyTurns >= 3 && world.prng.next() < 0.55;
    },
    execute: (world) => {
      world.royalFamily.empress.pregnant = false;
      world.royalFamily.empress.pregnancyTurns = 0;
      const childCount = world.royalFamily.children.length;
      const names = ['承平', '宏业', '昭景', '佑德', '崇圣'];
      const pickName = names[childCount % names.length] || `元${childCount + 1}`;
      const child = {
        id: `child_${Date.now()}_${childCount}`,
        name: pickName,
        title: childCount === 0 ? '皇长子' : `皇${childCount + 1}子`,
        gender: 'male',
        age: 0,
        alive: true,
        isHeir: world.royalFamily.heirId === null,
        tutor: null,
        traits: ['devoted', 'benevolent'],
        health: 'healthy',
        personalityIdea: '仁孝宽厚',
        history: [`${world.historyManager.getYearSeasonText(world.turn)} 降生于禁中坤宁宫。`]
      };
      world.royalFamily.children.push(child);
      if (child.isHeir) {
        world.royalFamily.heirId = child.id;
      }
      return { headline: '诞育麟儿', text: `皇后顺诞皇子【${child.name}】，满月设宴，定为宗嗣。` };
    }
  },
  {
    id: 'royal_birth_daughter',
    type: 'royal',
    category: 'palace',
    priority: 90,
    title: '明珠入掌 · 公主降诞',
    newsTemplate: '【明珠入掌】皇后诞下皇女，帝大喜，赐号永福公主，赏赐内外。',
    chronicleTemplate: '皇后诞公主，帝甚钟爱。',
    conditions: (world) => {
      const rf = world.royalFamily;
      return rf.empress && rf.empress.pregnant && rf.empress.pregnancyTurns >= 3;
    },
    execute: (world) => {
      world.royalFamily.empress.pregnant = false;
      world.royalFamily.empress.pregnancyTurns = 0;
      const childCount = world.royalFamily.children.length;
      const child = {
        id: `daughter_${Date.now()}_${childCount}`,
        name: '长乐',
        title: '长乐公主',
        gender: 'female',
        age: 0,
        alive: true,
        isHeir: false,
        health: 'healthy',
        history: [`${world.historyManager.getYearSeasonText(world.turn)} 降生于禁中坤宁宫。`]
      };
      world.royalFamily.children.push(child);
      return { headline: '明珠入掌', text: '皇后诞下皇女，宫闱一片祥和欢欣。' };
    }
  },
  {
    id: 'heir_turns_schooling_age',
    type: 'royal',
    category: 'palace',
    priority: 88,
    title: '东宫开蒙 · 择师之期',
    newsTemplate: '【东宫开蒙】皇太子年届六岁，知书识礼，廷臣纷纷奏请择选硕德宿儒入侍讲席。',
    chronicleTemplate: '储君六岁入阁读书，廷议择师。',
    conditions: (world) => {
      const heir = world.royalFamily.getHeir();
      return heir && heir.alive && heir.age === 6 && !heir.tutor;
    },
    execute: (world) => {
      const heir = world.royalFamily.getHeir();
      heir.history.push(`${world.historyManager.getYearSeasonText(world.turn)} 年及六岁，正式入文华殿启蒙开讲。`);
      return {
        headline: '东宫开蒙',
        text: `储君【${heir.name}】已届六龄，当择名臣辅导德器。`
      };
    }
  },
  {
    id: 'heir_tutor_assigned_spontaneous',
    type: 'royal',
    category: 'palace',
    priority: 82,
    title: '翰林侍读 · 储君授业',
    newsTemplate: '【帝师授业】内阁与翰林大学士奉旨入东宫直讲，日进《尚书》《资治通鉴》。',
    chronicleTemplate: '硕学大臣入东宫为储君日讲经史。',
    conditions: (world) => {
      const heir = world.royalFamily.getHeir();
      return heir && heir.alive && heir.age >= 7 && !heir.tutor && world.prng.next() < 0.35;
    },
    execute: (world) => {
      const heir = world.royalFamily.getHeir();
      // 优先从重要大臣中选一位 (例如沈恪或魏肃或陆伯渊)
      const cand = world.characterManager.getActive().find(c => c.faction === 'civil') || { name: '大学士陆伯渊', id: 'lu_boyuan' };
      heir.tutor = cand.name;
      heir.history.push(`${world.historyManager.getYearSeasonText(world.turn)} 以【${cand.name}】为师，专心诵习治道。`);
      world.characterManager.addRelationship(cand.id, heir.id, 'mentor_student');
      return { headline: '帝师授业', text: `储君拜【${cand.name}】为少傅师席，师生情契日厚。` };
    }
  },
  {
    id: 'heir_debates_court',
    type: 'royal',
    category: 'palace',
    priority: 85,
    title: '储君试政 · 殿廷发言',
    newsTemplate: '【东宫初政】储君弱冠临朝听政，论及州县度支与关塞战备，条理通达，上甚嘉许。',
    chronicleTemplate: '储君临朝侍立，初展文治器度。',
    conditions: (world) => {
      const heir = world.royalFamily.getHeir();
      return heir && heir.alive && heir.age >= 16 && heir.age <= 22 && world.prng.next() < 0.25;
    },
    execute: (world) => {
      const heir = world.royalFamily.getHeir();
      heir.history.push(`${world.historyManager.getYearSeasonText(world.turn)} 于奉天殿首次就国政进言，群臣称叹。`);
      return { headline: '东宫试政', text: `皇太子【${heir.name}】殿前条陈国是，器度沉稳，隐然有一代君父之范。` };
    }
  },
  {
    id: 'heir_wedding',
    type: 'royal',
    category: 'palace',
    priority: 86,
    title: '储宫纳妃 · 宗社固本',
    newsTemplate: '【储君大婚】册立名门之女为皇太子妃，礼成朝贺，宴劳文武，万方称庆。',
    chronicleTemplate: '储君纳妃，举国同欢。',
    conditions: (world) => {
      const heir = world.royalFamily.getHeir();
      return heir && heir.alive && heir.age >= 18 && !heir.married && world.prng.next() < 0.3;
    },
    execute: (world) => {
      const heir = world.royalFamily.getHeir();
      heir.married = true;
      heir.history.push(`${world.historyManager.getYearSeasonText(world.turn)} 遵制纳正妃，宗室藩篱愈加安稳。`);
      return { headline: '储君大婚', text: `皇太子【${heir.name}】行大婚典礼，百官上表称颂。` };
    }
  },
  {
    id: 'emperor_minor_ailment',
    type: 'royal',
    category: 'palace',
    priority: 75,
    title: '圣体小恙 · 罢朝数日',
    newsTemplate: '【圣体欠安】天候骤变，皇帝偶感风寒，卧内殿静摄，免朝三日。',
    chronicleTemplate: '帝偶感风寒，罢朝静摄。',
    conditions: (world) => {
      const emp = world.royalFamily.emperor;
      return emp.healthLevel >= 3 && emp.age >= 38 && world.prng.next() < (emp.age > 48 ? 0.2 : 0.1);
    },
    execute: (world) => {
      world.royalFamily.emperor.healthLevel = 3;
      return { headline: '圣体欠安', text: '御医进奉温补汤药，内阁承密旨处理常朝细务。' };
    }
  },
  {
    id: 'emperor_weakened_health',
    type: 'royal',
    category: 'palace',
    priority: 80,
    title: '宿疾渐频 · 龙体渐衰',
    newsTemplate: '【龙体多艰】皇帝年迈操劳，腰膝酸疼难支久坐，召诸医官日夜轮值随侍。',
    chronicleTemplate: '帝年事已高，宿疾渐繁。',
    conditions: (world) => {
      const emp = world.royalFamily.emperor;
      return emp.healthLevel === 3 && emp.age >= 46 && world.prng.next() < 0.25;
    },
    execute: (world) => {
      world.royalFamily.emperor.healthLevel = 2;
      return { headline: '龙体渐衰', text: '皇帝春秋渐盛，时有眩晕咳血之状，深居简出。' };
    }
  },
  {
    id: 'emperor_critical_health',
    type: 'royal',
    category: 'palace',
    priority: 95,
    title: '沉疴难愈 · 诏储君问药',
    newsTemplate: '【圣躬笃危】皇帝卧疾弥月不起，密召太子与首辅入暖阁受托顾命。',
    chronicleTemplate: '帝寝疾大笃，召储君近前。',
    conditions: (world) => {
      const emp = world.royalFamily.emperor;
      return emp.healthLevel === 2 && (emp.age >= 52 || world.prng.next() < 0.3);
    },
    execute: (world) => {
      world.royalFamily.emperor.healthLevel = 1;
      return { headline: '圣躬笃危', text: '皇帝紧握太子之手，切嘱守成安民，宗庙存亡系于一身。' };
    }
  },
  {
    id: 'empress_counsels_emperor',
    type: 'royal',
    category: 'palace',
    priority: 65,
    title: '中宫贤德 · 温勉君怀',
    newsTemplate: '【中宫进规】皇后侍坐御前，劝勉省刑薄敛、保颐圣躬，后宫肃然谨饬。',
    chronicleTemplate: '皇后进谏，帝纳其言。',
    conditions: (world) => {
      const empress = world.royalFamily.empress;
      return empress && empress.alive && world.prng.next() < 0.15;
    },
    execute: (world) => {
      return { headline: '中宫进规', text: '皇后贤淑有德，内闱安宁无波。' };
    }
  },
  {
    id: 'dowager_celebration',
    type: 'royal',
    category: 'palace',
    priority: 70,
    title: '太母万寿 · 慈宁盛宴',
    newsTemplate: '【慈宁盛典】恭逢太后万寿圣节，帝躬率后妃百官奉觞上寿，大颁中外。',
    chronicleTemplate: '太后寿辰，帝亲率宗室进爵。',
    conditions: (world) => {
      return world.turn % 8 === 0 && world.prng.next() < 0.4;
    },
    execute: (world) => {
      return { headline: '慈宁盛典', text: '宫中开筵三日，普赐群臣锦绮，孝治之风广闻天下。' };
    }
  },
  {
    id: 'emperor_healthy_season',
    type: 'royal',
    category: 'palace',
    priority: 60,
    title: '圣体平复 · 起居如常',
    newsTemplate: '【圣躬康泰】御医诊脉奏闻圣体平复，皇帝亲临文华殿翻阅诸路章奏。',
    chronicleTemplate: '帝体康复，御门听政。',
    conditions: (world) => {
      const emp = world.royalFamily.emperor;
      return emp.healthLevel === 3 && emp.age < 46 && world.prng.next() < 0.35;
    },
    execute: (world) => {
      world.royalFamily.emperor.healthLevel = 4;
      return { headline: '圣躬康泰', text: '皇帝精神焕发，复御奉天门听政。' };
    }
  },
  {
    id: 'prince_scholar_discussion',
    type: 'royal',
    category: 'palace',
    priority: 72,
    title: '文华论史 · 储君省思',
    newsTemplate: '【东宫课读】储君与东宫讲官议论前代治乱兴衰，以为仁义与权法不可偏废。',
    chronicleTemplate: '储君研习史乘，卓有独见。',
    conditions: (world) => {
      const heir = world.royalFamily.getHeir();
      return heir && heir.alive && heir.age >= 10 && heir.age <= 16 && world.prng.next() < 0.25;
    },
    execute: (world) => {
      return { headline: '东宫课读', text: '讲官深慰储君颖敏明哲，社稷长治久安有望。' };
    }
  },
  {
    id: 'empress_passing',
    type: 'royal',
    category: 'palace',
    priority: 98,
    title: '大行皇后崩逝 · 六宫缟素',
    newsTemplate: '【长秋易主】皇后崩于坤宁宫，帝悲恸辍朝五日，诏议谥册，百官服丧。',
    chronicleTemplate: '皇后崩，举国哀悼。',
    conditions: (world) => {
      const empress = world.royalFamily.empress;
      return empress && empress.alive && empress.age >= 48 && world.prng.next() < (empress.age > 58 ? 0.25 : 0.08);
    },
    execute: (world) => {
      world.royalFamily.empress.alive = false;
      return { headline: '大行皇后崩', text: '中宫忽崩，皇帝哀悼良深，天下禁止嫁娶音乐百日。' };
    }
  }
];
