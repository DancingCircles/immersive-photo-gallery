import type { WorkDetail } from '../../domain/work/work.ts';

// Published backend catalogue snapshot captured on 2026-09-12. The matching
// images live in public/art/demo, so the open-source presentation runs offline.
const snapshotRecords = [
  {
    id: 'work-3f002a09-3fd2-455e-8db0-95c1c8cff716',
    title: 'Wahcantt, Pakistan (nature photography)',
    photographerName: 'Shami Hassan',
    publishedAt: '2026-09-12T09:38:31.739828Z',
    width: 720,
    height: 960,
    category: '嫩叶',
    artistStatement: 'واہ کینٹ ،پا کستا ن',
    imageAnalysis:
      '画面以微距视角聚焦一丛自粗糙树皮缝隙中抽出的嫩叶，主体不居中而略偏左下，暗色树皮以斜向块面占据其余空间，形成粗粝与柔嫩、暗沉与鲜绿的强烈对照。叶片层层叠压，叶尖朝右上舒展，构成由左下向右上的潜在引导线，重心落在叶丛顶端的亮部。前景树皮纹理清晰可触，背景因浅景深化为虚化的暗调与零散蓝光斑，负空间偏重但并非空白，而是以幽蓝冷光托出叶缘。光线似来自侧上方，叶面留下局部高光，叶脉与细毛可见，阴影处保留一定层次，色温偏冷，绿与蓝的冷暖对比主导色彩。技术完成度尚可，焦点稳定，暗部略显厚重、噪点可见，适合近距离静观。',
    attribution: {
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Wahcantt,_Pakistan_(nature_photography).jpg',
      licenseName: 'CC BY-SA',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
      creditLine: 'Shami Hassan',
    },
    localizedTitle: '瓦赫坎特，巴基斯坦（自然摄影）',
    localizedDescription: 'واہ کینٹ ،پا کستا ن',
    promptZh:
      '微距特写，暗色粗糙树皮缝隙中长出一丛鲜绿嫩叶，叶片层叠、叶尖朝右上舒展，叶面有侧上方冷光形成的高光与可见叶脉，前景树皮纹理清晰可触，背景虚化为幽暗深色并散落蓝色冷光斑，主体略偏左下、整体呈暗调，冷蓝环境光与翠绿叶片形成冷暖对比，浅景深，负空间偏重，细节密度中等，整体气质幽静而清冷，宽高比3:4。',
    promptEn:
      'macro close-up, a cluster of fresh green leaves emerging from a crevice in dark rough tree bark, leaves layered and tips extending toward the upper right, cool light from the upper side creating highlights on the leaf surfaces with visible veins, foreground bark texture sharp and tactile, background blurred into deep dark tones with scattered cool blue light patches, subject slightly toward the lower left, overall low-key dark tone, cold blue ambient light contrasting with vivid green leaves, shallow depth of field, heavy negative space, medium detail density, quiet and cool mood, aspect ratio 3:4.',
    negativePrompt:
      '额外叶片，重复叶片，额外主体，畸形叶片，扭曲树皮，错误文字，水印，签名，过度锐化，过度饱和，噪点过多，模糊失焦，塑料感，人工光斑，过曝高光，色彩断层',
  },
  {
    id: 'work-aa06bfa3-728c-4a8c-b749-0aaf77c8cc96',
    title: 'Front cover of A Sharp Eye on wildlife photography - Issue Five',
    photographerName: 'Charles J. Sharp',
    publishedAt: '2026-09-12T09:38:26.098462Z',
    width: 1600,
    height: 2071,
    category: '鸟类',
    artistStatement:
      'Front cover of A Sharp Eye on wildlife photography - Issue Five Read Issue Five online',
    imageAnalysis:
      '画面以一只侧身栖枝的蜂虎为主体，鸟身自左上向右下斜置，头部与长喙指向右侧，形成明确的方向性视觉动线，喙前留出充足负空间。枯枝横穿中景，略压住鸟身下缘，构成简洁的支撑关系。背景大面积虚化成深绿与灰褐的柔和斑块，前中后景层次清晰，衬托出羽毛质感。光线均匀柔和，无明显投影，绿、橙、蓝与喉部红色形成高饱和对比，明暗过渡细腻。眼部与喙部锐利，羽纹可辨，技术完成度较高。但姿态是静态肖像，缺少行为与环境的互动，叙事节奏偏静，更多依靠色彩与形态本身吸引观看。封面文字占据上方与右下，属于版式叠加，非摄影本体。',
    attribution: {
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Front_cover_of_A_Sharp_Eye_on_wildlife_photography_-_Issue_Five.jpg',
      licenseName: 'CC BY-SA',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
      creditLine: 'Charles J. Sharp',
    },
    localizedTitle: '《锐眼看野生动物摄影》第五期封面',
    localizedDescription: '《锐眼看野生动物摄影》第五期封面 在线阅读第五期',
    promptZh:
      '一只蜂虎侧身栖息在横伸的枯枝上，身体自左上向右下倾斜，细长的黑色喙指向画面右侧，喙前留白。头部与胸腹为橙褐色，喉部鲜红，眼周有黑色贯眼纹与白色颊纹，背部与翼面为亮绿色，尾羽与下腹呈蓝色，长尾垂向左下。枝条为灰褐色粗糙木质，横穿中景。背景大面积虚化为深绿与灰褐的柔和色块，主体清晰、背景模糊。柔和均匀的散射光，高饱和的绿橙蓝红对比，羽毛纹理细腻。竖幅构图，主体位于画面中部偏左，右侧为负空间，上方与右下有杂志封面文字排版。画面宽高比约 3:4。',
    promptEn:
      'A bee-eater perched side-on on a horizontal dead branch, body slanting from upper left to lower right, long slender black beak pointing to the right with open space in front of it. Head and underparts are rufous-orange, throat bright red, with a black eye stripe and white cheek, bright green back and wing coverts, blue tail and lower belly, long tail extending down to the lower left. The branch is grey-brown rough wood crossing the middle ground. The background is heavily blurred into soft dark green and grey-brown patches, subject sharp, background out of focus. Soft even diffused light, high-saturation green, orange, blue and red contrasts, fine feather texture. Vertical composition, subject placed centre-left, negative space on the right, magazine cover typography at the top and lower right. Aspect ratio approximately 3:4.',
    negativePrompt:
      '额外主体，重复物体，畸形，错误文字，水印，过度锐化，过度饱和，噪点，模糊主体，多余肢体，错位眼睛，比例失调，背景杂乱',
  },
  {
    id: 'work-852ba582-c184-4b28-94ab-2973a990c618',
    title:
      'Nature photography on Coca-Cola vending machines, Canyon Village, Yellowstone National Park, 2009',
    photographerName: 'DimiTalen',
    publishedAt: '2026-09-12T09:38:21.176332Z',
    width: 1600,
    height: 2250,
    category: '自动售货机',
    artistStatement:
      'Nature photography on Coca-Cola vending machines, Canyon Village, Yellowstone National Park, 2009',
    imageAnalysis:
      '两台可口可乐自动售货机以近乎对称的并置占据画面，左侧机身的弧面玻璃映出野牛与草地的自然画面，右侧则是一道跌落的瀑布，红色标志在冷绿与灰白之间形成节奏点。玻璃表面叠加了室内环境的倒影，使野牛、瀑布与模糊人影处在同一平面，制造出观看与被观看的层次。构图上主体充满画框，边缘裁切紧凑，机身的垂直黑边成为分割线，引导视线在左右两台机器间往返。均匀的室内光让色彩还原平稳，红白标志与自然影像的冷暖对比被保留，明暗层次集中在玻璃反射的高光区。整体接近街头记录的观看距离，细节清晰，后期克制，未过度修饰。',
    attribution: {
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Nature_photography_on_Coca-Cola_vending_machines,_Canyon_Village,_Yellowstone_National_Park,_2009.jpg',
      licenseName: 'CC0',
      licenseUrl: 'http://creativecommons.org/publicdomain/zero/1.0/deed.en',
      creditLine: 'DimiTalen',
    },
    localizedTitle: '黄石峡谷村的可口可乐自动售货机上的自然摄影，2009年',
    localizedDescription:
      '黄石国家公园峡谷村的可口可乐自动售货机上的自然摄影，2009年',
    promptZh:
      '两台并排的黑色可口可乐自动售货机，左侧机身正面印有野牛与草地自然摄影，右侧机身印有瀑布与岩壁风景，红色“Enjoy Coca-Cola”标志位于各自上端，机身侧面有投币口与一排价格按钮，玻璃表面有室内环境与模糊人影的反射，室内均匀光线，红白标志与冷绿灰白自然影像形成色彩对比，黑色机身框架与银色细节，轻微高光溢出，街头摄影质感，画面比例 3:4。',
    promptEn:
      'Two side-by-side black Coca-Cola vending machines, left machine front featuring nature photography of a bison on grassland, right machine featuring a waterfall and rocky cliff landscape, red “Enjoy Coca-Cola” logos at the top of each, coin slots and rows of price buttons on the sides, glass surfaces reflecting the indoor environment and blurred human figures, even indoor lighting, red and white logos contrasting with cool green and gray-white natural imagery, black machine frames with silver details, slight highlight bloom, street photography feel, aspect ratio 3:4.',
    negativePrompt:
      'extra vending machines, duplicated objects, deformed animals, distorted logos, wrong text, watermark, over-sharpening, excessive noise, blurry focus, unnatural reflections, missing buttons',
  },
  {
    id: 'work-f31988b5-8098-49ea-bb8f-faadf68cbffb',
    title: 'Nature 135',
    photographerName: 'Tejeshmavinamar',
    publishedAt: '2026-09-12T09:38:07.478111Z',
    width: 1600,
    height: 2134,
    category: '竖幅',
    artistStatement: 'After noon wether',
    imageAnalysis:
      '竖幅画面以蓝天占据大半，低角度小路自前景中央向纵深收束，形成明确的引导线与近似对称的骨架。两侧椰树高低错落，左侧白色建筑与围栏构成中景硬边，右侧树冠更密，平衡了左重右轻的倾向。视觉重心落在路面消失点与远端的云团之间，云层由右向左聚散，暗示午后对流天气的流动感。自然光自右上方射入，右侧椰叶呈半剪影，左侧受光更亮，明暗层次拉开。青绿草地、灰白路面与高饱和蓝天形成冷调对比，色彩明快但边缘略硬，细节密度集中在树冠与云朵，整体气质清爽、开阔，叙事趋于静观而非事件。',
    attribution: {
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Nature_135.jpg',
      licenseName: 'CC BY-SA',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
      creditLine: 'Tejeshmavinamar',
    },
    localizedTitle: '自然135',
    localizedDescription: '午后的潮湿天气',
    promptZh:
      '竖幅热带风光，一条灰白色水泥小路从画面底部中央笔直延伸至远方消失点，两侧是茂密的绿色草地。道路两旁种植高大椰子树，左侧有三四棵椰树与一栋白色多层建筑及围栏，右侧有更多椰树并向远处密集延伸，其中一棵高椰的树冠在逆光中呈半剪影。天空占画面约三分之二，为高饱和蓝色，分布大片白色积云与丝状卷云，右侧云层更密，左上方露出一块晴空。低角度平视，路面形成对称引导线，前中后景清晰，自然日光从右上方照射，树叶有明暗对比，色彩鲜亮，整体清爽开阔。宽高比 3:4。',
    promptEn:
      'Vertical tropical landscape, a light gray concrete path extending straight from the bottom center to a distant vanishing point, flanked by lush green grass. Tall coconut palms line both sides; on the left are three or four palms with a white multi-story building and a fence, while on the right more palms extend densely into the distance, one tall palm crown appearing as a half silhouette against the backlight. The sky occupies about two thirds of the frame, in high-saturation blue with large white cumulus and wispy cirrus clouds, denser on the right and an open clear patch at the upper left. Low eye-level angle, the path forms a symmetrical leading line, clear foreground, midground and background, natural sunlight from the upper right, contrasting light and shade on the foliage, vivid colors, fresh and open atmosphere. Aspect ratio 3:4.',
    negativePrompt:
      'extra subjects, duplicated palms, deformed trees, distorted path, incorrect perspective, text, watermark, signature, logo, over-sharpened edges, excessive HDR, unnatural saturation, blurry foreground, misplaced horizon, floating objects, cut-off trunks',
  },
  {
    id: 'work-baa7432e-6609-45c9-b88f-0f8301707255',
    title:
      'Dülmen, Merfeld, Dülmener Wildpferde in der Wildbahn -- 2016 -- 4740',
    photographerName: 'Dietmar Rabich',
    publishedAt: '2026-09-12T09:38:03.34101Z',
    width: 1600,
    height: 1067,
    category: '马群',
    artistStatement:
      'Dülmen ponies in the Wildbahn in the Merfelder Bruch (COE-004) in the morning fog at sunrise, Merfeld, Dülmen, North Rhine-Westphalia, Germany\nThe Dülmen horse is a breed of pony that lives mainly in Dülmen in Westphalia in the Merfelder Bruch. Around 300 to 400 horses live in this fenced-off area, also known as the Wild Horse Trail, largely unaffected by humans. The wild horses of Dülmen were first mentioned in documents in 1316. One of the oldest German horse breeds, originally called Dülmener Brücher, these horses have been listed on the Red List of endangered livestock breeds by the Society for the Preservation of Old and Endangered Domestic Animal Breeds since February 1994. From a biological point of view, the Dülmen horse is not a wild horse. The name refers to its semi-wild lifestyle.',
    imageAnalysis:
      '逆光晨雾中，马群横向散布于草地，成为画面下三分之一的前景节奏。树干纵向分隔中景，形成近似框景与重复结构；光源自树冠缝隙溢出，放射光束构成强烈引导线，将视线从上方拉回地面马群。负空间由雾与林冠暗部承担，前后景以逆光剪影与亮部层次拉开景深。暖金色色温统一画面，草地暗部与光束亮部形成鲜明动态范围。马匹低头、缓行、错落的瞬间共同构成宁静而缓慢的田园节奏，叙事含蓄。高光边缘有轻微溢出，整体清晰，属于平视的中远景观看距离。',
    attribution: {
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:D%C3%BClmen,_Merfeld,_D%C3%BClmener_Wildpferde_in_der_Wildbahn_--_2016_--_4740.jpg',
      licenseName: 'CC BY-SA',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
      creditLine: 'Dietmar Rabich',
    },
    localizedTitle: '迪尔门，梅尔费尔德，野外的迪尔门野马——2016——4740',
    localizedDescription:
      '日出晨雾中，梅尔费尔德布鲁赫（COE-004）野外马道上的迪尔门矮种马，德国北莱茵-威斯特法伦州迪尔门梅尔费尔德。迪尔门马是一种主要生活在威斯特法伦迪尔门梅尔费尔德布鲁赫的矮种马。约300至400匹马生活在也被称为野马道的围栏区域内，基本不受人类影响。迪尔门野马最早于1316年见于文献记载。作为德国最古老的马种之一，最初称为迪尔门布鲁赫马，自1994年2月起被“保存古老与濒危家畜品种协会”列入濒危家畜品种红色名录。从生物学角度看，迪尔门马并非野马，其名称指半野生生活方式。',
    promptZh:
      '清晨林地中一群灰色矮种马散布在绿色草地上，逆光下金色阳光穿过树冠形成放射状光束，晨雾弥漫，树干纵向排列，马匹三五成群低头、缓行，前景草地暗部与光束亮部形成明暗对比，暖金色调统一，横画幅，平视中远景，前景、中景与背景层次清晰，画面宽高比 3:2。',
    promptEn:
      'A herd of gray ponies scattered on green grass in a woodland at early morning, golden backlight streaming through the tree canopy as radiating sunbeams, mist in the air, vertical tree trunks, horses in small groups lowering heads or walking slowly, dark foreground grass contrasting with bright beams, unified warm golden tones, horizontal composition, eye-level medium-wide shot, clear foreground, midground and background layers, aspect ratio 3:2.',
    negativePrompt:
      '额外主体，重复的马，畸形马匹，错误文字，水印，过度锐化，过曝天空，杂乱光斑，塑料质感，卡通化，模糊主体。',
  },
  {
    id: 'work-dade41a4-559e-4b5b-8030-5352f97f76dc',
    title: 'Nature Photography from Ch 13',
    photographerName: 'Iurie Nistor',
    publishedAt: '2026-09-12T09:37:49.255394Z',
    width: 1600,
    height: 2400,
    category: '枯枝',
    artistStatement:
      'Nature photography. Please, contribute by adding a description.',
    imageAnalysis:
      '画面以细长的枯茎与球形花序为主体，焦点落在中景一两枚花序上，其余前后花序随景深渐次虚化，形成清晰的虚实层次。线条自画面下方斜向上升，主茎构成隐约的引导线，视线被牵引至中上部，重心略偏右而上方留有明亮负空间。背景为逆光下模糊的树影与天空，暖黄褐色调统一，色温偏暖，暗部沉实、亮部略平，动态范围被有意压缩。竖直构图裁切紧贴主体，茎秆疏密交错带来节奏，如秋冬荒野的静物诗。技术完成度稳健，唯前景茎秆稍显杂乱，右上虚化飞虫略抢注意，整体观看距离亲近，适宜中近景微观阅读。',
    attribution: {
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Nature_Photography_from_Ch_13.jpg',
      licenseName: 'CC0',
      licenseUrl: 'http://creativecommons.org/publicdomain/zero/1.0/deed.en',
      creditLine: 'Iurie Nistor',
    },
    localizedTitle: '第13章自然摄影',
    localizedDescription: '自然摄影。请通过添加描述来贡献内容。',
    promptZh:
      '竖幅自然微观摄影，数根细长枯黄茎秆从画面下方斜向伸展交错，茎顶端生有球形干枯花序，花序呈米白至浅褐色，中景一两枚花序清晰锐利，前后花序与背景自然虚化，浅景深；背景为逆光下模糊的枯树影与浅色天空，暖黄褐色调统一，柔和侧逆光，暗部沉实，亮部略平，负空间位于上方，线条疏密有节奏，画面无额外主体，宽高比2:3。',
    promptEn:
      'Vertical nature macro photograph, several slender dry yellow-brown stems extending diagonally and crossing from the lower frame, each topped with a small spherical dried flower head in cream to light brown, one or two flower heads in the midground sharply in focus while foreground and background flower heads and the blurred trees and pale sky behind fall out of focus, shallow depth of field, warm yellow-brown unified color palette, soft backlight and side light, deep shadows, slightly flat highlights, negative space in the upper area, rhythmic spacing of thin lines, no extra subjects, aspect ratio 2:3.',
    negativePrompt:
      'extra subjects, duplicated plants, deformed stems, deformed flower heads, misshapen spheres, text, watermark, signature, oversharpened halos, harsh HDR, unnatural saturation, blurry subject, cluttered composition, insects in focus',
  },
  {
    id: 'work-fef7c1fc-4e39-4437-9915-f652f65d4db8',
    title: 'Nature Photography from Ch 10',
    photographerName: 'Iurie Nistor',
    publishedAt: '2026-09-12T09:37:40.413317Z',
    width: 1600,
    height: 1067,
    category: '枯叶',
    artistStatement:
      'Nature photography. Please, contribute by adding a description.',
    imageAnalysis:
      '画面以一片逆光枯叶为主体，叶面呈暖橙色，边缘干枯碎裂，叶脉与破损处透出光感。叶片位于画面右半偏中下，由右侧细枝托住，左侧与上方大片虚化背景形成负空间，视觉重心因此被稳稳压向叶片本身。背景由失焦的树干与冷调天光构成，左上暗褐、右侧偏蓝灰，与叶片的暖橙形成冷暖对比。逆光使叶肉变得半透明，纹理清晰，边缘高光略有余量，浅景深有效剥离前后层次。叶柄附近似有细小昆虫或阴影细节，增加了一点观看节奏，但瞬间感偏静。整体技术完成度良好，属于近距离自然特写，叙事简洁克制。',
    attribution: {
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Nature_Photography_from_Ch_10.jpg',
      licenseName: 'CC0',
      licenseUrl: 'http://creativecommons.org/publicdomain/zero/1.0/deed.en',
      creditLine: 'Iurie Nistor',
    },
    localizedTitle: '逆光下的枯叶',
    localizedDescription: '自然摄影。请通过添加描述来贡献内容。',
    promptZh:
      '一片干枯碎裂的橙色树叶挂在右侧细枝上，逆光下叶脉与破损边缘透光，叶片位于画面右半偏中下，左侧和上方是大面积虚化的树干与冷蓝色天空背景，浅景深，冷暖对比明显，暖橙叶面与蓝灰背景，自然光从后方穿透，细节集中在叶片，竖幅构图，宽高比2:3。',
    promptEn:
      'A single dry, torn orange leaf hanging from a thin twig on the right side, backlit so the veins and broken edges glow, positioned in the right-center-lower area of the frame, with a large blurred expanse of tree trunk and cool blue sky on the left and above, shallow depth of field, strong warm-cool contrast, warm orange leaf against blue-gray background, natural light passing from behind, detail concentrated on the leaf, vertical composition, aspect ratio 2:3.',
    negativePrompt:
      '额外叶片，多个主体，重复物体，畸形结构，错误文字，水印，签名，过度锐化，过曝光斑，杂乱枝条，卡通化，插画，3D渲染',
  },
  {
    id: 'work-2d3b78b1-afb9-48f9-8a97-a036514b30c2',
    title: 'Wildlife-photography-in-kerala',
    photographerName: 'Priyaariyani1982',
    publishedAt: '2026-09-12T09:37:34.147654Z',
    width: 1600,
    height: 1067,
    category: '猛禽',
    artistStatement: 'Wildlife photographer in Kerala',
    imageAnalysis:
      '画面以一只斑纹幼鹰为主体，它立于横贯下半幅的粗壮枝干上，身体略偏右，头部向左上方回望，形成明确的视线方向与动势。枝干自左下向右上微斜，构成稳定支撑与横向引导线，占据约三分之一画面；上部与左侧大量虚化的绿叶与高光光斑填充负空间，形成前实后虚的景深分离。自然柔光从右上方照来，勾勒出胸腹米白底色上的深褐点斑与翼部层次，也照亮枝干表面的灰绿苔痕。整体色温偏暖，黄绿背景与主体棕褐形成互补对比，明暗过渡平缓。主体眼神锐利、姿态警觉，静态中带张力；对焦精准，羽毛细节与树皮肌理清晰，是一帧完成度较高的生态记录。',
    attribution: {
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Wildlife-photography-in-kerala.jpg',
      licenseName: 'CC BY-SA',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
      creditLine: 'Priyaariyani1982',
    },
    localizedTitle: '喀拉拉邦的野生动物摄影',
    localizedDescription: '喀拉拉的野生动物摄影师',
    promptZh:
      '一只幼年猛禽停栖在横向延伸的粗枝上，身体略偏画面右侧，头部转向左上方回望；鸟胸腹米白底色布满深褐色斑纹，翼部深褐，黄色脚爪抓握枝干；枝干横贯画面下部，表面有灰绿色苔痕与浅色斑驳纹理；背景是密集虚化的绿色树叶与明亮圆形光斑，前景主体清晰，背景柔和散焦；自然侧光从右上方照入，暖黄绿色调，棕褐与黄绿形成对比；写实生态摄影风格，细节清晰，景深分离，整体安静警觉，画面宽高比 3:2。',
    promptEn:
      'A juvenile bird of prey perched on a thick horizontal branch, body slightly right of center, head turned back toward the upper left; pale cream underparts covered with dark brown spots, dark brown wings, yellow talons gripping the bark; the branch crosses the lower part of the frame with grey-green lichen and pale mottled texture; the background is dense, softly blurred green foliage with bright circular bokeh highlights, foreground subject sharp and background defocused; natural side light from the upper right, warm yellow-green tones, brown and yellow-green contrast; realistic wildlife photography, clear detail, shallow depth of field, calm and alert mood, aspect ratio 3:2.',
    negativePrompt:
      '额外主体，重复物体，多余肢体，畸形鸟爪，扭曲喙部，错误文字，水印，签名，过度锐化，过曝高光，色彩断层，低分辨率，噪点，人工合成感',
  },
  {
    id: 'work-4a477a1e-a2e3-4edc-b581-5830afba1dc6',
    title: 'Nature Photography from Ch 09',
    photographerName: 'Iurie Nistor',
    publishedAt: '2026-09-12T09:37:29.355357Z',
    width: 1600,
    height: 1067,
    category: '植物',
    artistStatement: 'Dry flower from Dumitru Rascanu park',
    imageAnalysis:
      '这张微距照片以干枯的伞形花序为唯一主体，几根细长的伞梗从下方中心点呈放射状向四周展开，末端垂挂着绒毛密布的干缩花头。主体略偏右下，放射线自然形成引导线，把视线从中心带向各个端点，形成轻盈的环状动线。背景完全虚化为暖褐色与浅米色交织的色块，负空间充分，浅景深将前中后景清晰剥离。光线从上方偏侧柔和照入，在绒毛边缘勾出淡淡亮边，凸显其蓬松质感；整体色温偏暖，明暗层次细腻，但部分高光略靠近过曝边缘。画面处于静止状态，节奏由放射线统一，呈现冬季自然静物的克制观看距离，技术完成度稳健。',
    attribution: {
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Nature_Photography_from_Ch_09.jpg',
      licenseName: 'CC0',
      licenseUrl: 'http://creativecommons.org/publicdomain/zero/1.0/deed.en',
      creditLine: 'Iurie Nistor',
    },
    localizedTitle: '杜米特鲁·拉斯卡努公园的干花',
    localizedDescription:
      '一幅植物微距摄影，呈现干枯伞形花序的细密绒毛与放射结构，背景为柔和虚化的暖褐色。',
    promptZh:
      '微距摄影，一株干枯的伞形花序，几根细长伞梗从下方中心点呈放射状展开，末端垂挂带有细密绒毛的干缩花头，主体略偏右下。背景为完全虚化的暖褐色与浅米色色块，浅景深，前中后景清晰剥离，负空间充分。柔和侧上方光线，在绒毛边缘形成淡淡亮边，整体暖色调，明暗层次细腻。真实自然静物，画面比例 3:2。',
    promptEn:
      'Macro photography, a single dried umbellifer inflorescence, several thin stalks radiating from a lower central point, each ending in a shriveled flower head covered with fine fuzzy hairs, subject slightly right of center. Background is fully blurred warm brown and pale beige color fields, shallow depth of field, clear separation of foreground, midground, and background, ample negative space. Soft light from above and slightly to the side, creating a faint bright rim on the fuzzy edges, overall warm color temperature, delicate tonal gradation. Realistic natural still life, aspect ratio 3:2.',
    negativePrompt:
      'extra subjects, duplicate objects, distorted plant structures, malformed stems, messy overlapping lines, incorrect text, watermark, signature, logo, oversharpening, HDR halos, unnatural saturation, harsh shadows, cluttered background, visible camera equipment',
  },
  {
    id: 'work-ee98fa87-ccff-4888-998b-c05c740d713d',
    title: 'Nature Photography from Ch 07',
    photographerName: 'Iurie Nistor',
    publishedAt: '2026-09-12T09:37:19.458083Z',
    width: 1600,
    height: 1067,
    category: '植物微距',
    artistStatement:
      'Nature photography. Please, contribute by adding a description.',
    imageAnalysis:
      '画面以密集的干枯花苞群为唯一主体，属于微距特写。焦点落在中下部一簇展开的苞片，尖锐的齿状结构清晰可辨；上方与四周迅速离焦，形成色彩与明暗的抽象过渡。构图偏满，边缘刻意截断花簇，让重复的苞片肌理填满画框，并借浅景深把视线锚定在中前部。光线似自侧方来，暖红褐与暗紫在转折处拉开层次，高光处略有过曝，但整体动态范围温和。色彩统一而克制，没有多余元素干扰，呈现植物枯萎后的干燥质感与静谧节奏，完成度尚可。',
    attribution: {
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Nature_Photography_from_Ch_07.jpg',
      licenseName: 'CC0',
      licenseUrl: 'http://creativecommons.org/publicdomain/zero/1.0/deed.en',
      creditLine: 'Iurie Nistor',
    },
    localizedTitle: '干燥花序微距特写',
    localizedDescription: '自然摄影。请通过添加描述来贡献内容。',
    promptZh:
      '微距特写，画面被密集的干枯植物花苞填满，呈红褐与暗紫色调。焦点集中在中下部一簇展开的苞片，齿状尖端清晰锐利，上方与四周因浅景深而大幅虚化。暖色侧光勾勒轮廓，转折处有轻微高光。花苞肌理重复堆叠，边缘截断，无天空或环境背景。整体干燥、静谧、暖调，细节密度高。画面宽高比为3:2。',
    promptEn:
      'Macro close-up, the frame tightly filled with dense clusters of dried plant flower buds in reddish-brown and muted purple tones. Focus is on one opened cluster in the lower-center area, with sharp, toothed tips; upper and surrounding clusters fall heavily out of focus due to shallow depth of field. Warm side light outlines the forms, with slight highlight clipping at curves. Repeated, overlapping bud textures, edges cropped, no sky or environmental background. Overall dry, quiet, warm-toned, high detail density. Aspect ratio 3:2.',
    negativePrompt:
      'extra subjects, duplicated objects, deformed shapes, malformed structures, text, watermark, logo, oversharpening, unnatural blur, oversaturated colors, studio lighting, human elements, animals, insects',
  },
  {
    id: 'work-2d89851a-de98-42f6-bde3-39fbc88f08bd',
    title:
      '009 Wildlife Photographers in ghillie suits looking for red deers 2',
    photographerName: 'Giles Laurent',
    publishedAt: '2026-09-12T09:36:55.835465Z',
    width: 1600,
    height: 2134,
    category: '人物',
    artistStatement:
      'Wildlife photographers wearing a ghillie suit looking for red deers in the Aletsch Forest Nature Reserve. Some wild animals (such as red deers) are very difficult to approach without disturbing them, which sometimes leads some wildlife photographers to wear a ghillie suit when they go in search of them. By remaining undetected, wildlife photographers can observe animal behaviour that would otherwise not be observable if the animal would have had knowledge of human presence. Image set number 2 out of 6.',
    imageAnalysis:
      '画面采用竖幅构图，一位穿着全身伪装服的摄影师立于林间，双手横持一支包裹迷彩布的长焦镜头，人物大致居中，成为视觉重心。前景为覆盖松针与碎石的坡地，左侧倒木与右下树根形成不规则框架，但地面杂枝略显抢眼。中景针叶枝条横向铺展，以重复线条引导视线向人物收拢；背景树干垂直切割空间，深色树皮与受光叶片形成前中后层次与负空间。逆光自上方穿透树冠，叶片呈明亮黄绿色，人物与树干落入暗部，冷暖与明暗对比清晰，高光边缘略有过曝。整体色调自然，光线质感生动，瞬间平静，带有观察与等待的叙事意味。',
    attribution: {
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:009_Wildlife_Photographers_in_ghillie_suits_looking_for_red_deers_2.jpg',
      licenseName: 'CC BY-SA',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
      creditLine: 'Giles Laurent',
    },
    localizedTitle: '穿着伪装服的野生动物摄影师在阿莱奇森林保护区寻找马鹿 2',
    localizedDescription:
      '穿着伪装服的野生动物摄影师在阿莱奇森林自然保护区寻找马鹿。一些野生动物（如马鹿）很难在不打扰它们的情况下接近，因此有时一些野生动物摄影师在寻找它们时会穿上伪装服。通过保持不被发现，野生动物摄影师可以观察动物行为，否则如果动物知道人类存在，这些行为将无法观察到。图片集第 2 组，共 6 组。',
    promptZh:
      '竖幅构图，一位穿着全身草叶伪装服的人站在森林中，头戴全脸迷彩面罩，双手横抱一支缠绕迷彩布的长焦镜头，身穿迷彩裤与浅棕色徒步鞋，身后背带隐约可见。人物居中，脚下是松针、碎石与枯枝覆盖的坡地，左侧有倒木，右侧有粗壮树干与裸露树根。中景密集的针叶枝条横向伸展，形成重复的引导线，背景树干垂直排列，树冠间露出小块蓝色天空。逆光从上方穿透树叶，叶片呈明亮黄绿色，人物与树干处于暗部，地面有斑驳树影。画面清晰，细节丰富，自然日光，冷暖与明暗层次分明，整体安静、观察的氛围。宽高比 3:4。',
    promptEn:
      'Vertical composition, a person in a full-body grass and leaf ghillie suit stands in a forest, wearing a full-face camouflage mask, holding a long telephoto lens wrapped in camouflage cloth horizontally with both hands, wearing camouflage pants and light brown hiking shoes, shoulder straps faintly visible. The figure is centered, standing on a slope covered with pine needles, small rocks, and dry twigs, with a fallen log on the left and a thick tree trunk with exposed roots on the right. Dense coniferous branches spread horizontally in the midground, forming repeated leading lines, while vertical tree trunks fill the background, with small patches of blue sky visible through the canopy. Backlight from above filters through the foliage, turning leaves bright yellow-green, while the figure and trunks remain in shadow, with dappled light on the ground. Sharp details, rich texture, natural daylight, clear contrast between warm and cool tones and light and shadow, quiet, observant atmosphere. Aspect ratio 3:4.',
    negativePrompt:
      '额外主体，重复物体，畸形，错误文字，水印，过度锐化，模糊，低分辨率，不自然的颜色，过度曝光，卡通风格，插画，3D 渲染',
  },
  {
    id: 'work-3b318f84-027a-4dda-b384-89ecb40eefb9',
    title: 'Nature photography by Argha Mallick 01',
    photographerName: 'Arghamallick5151',
    publishedAt: '2026-09-12T09:36:46.986652Z',
    width: 1600,
    height: 2134,
    category: '植物',
    artistStatement: 'Beauty of our colourful Nature',
    imageAnalysis:
      '画面以直立分枝的绒状花序为主体，粉紫花团与深红花苞沿枝条纵向分布，形成自然的生长序列。构图采用竖幅，主枝偏中轴向上伸展，底部与右侧的小花簇构成呼应，暗部负空间将视线压向中央亮部。逆光或侧逆光使花丝边缘产生透亮绒毛质感，前景花苞较实，后景枝叶与暗背景渐隐，形成层次但不追求强烈景深虚化。色彩以粉紫为主调，辅以暗绿、褐红与金色碎点，明暗对比强，色温偏冷。高光处略显溢出，暗部细节偏闷，右下角文字水印影响纯净度，整体观看距离偏近，强调局部生长节奏与冷艳气氛。',
    attribution: {
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Nature_photography_by_Argha_Mallick_01.jpg',
      licenseName: 'CC BY-SA',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
      creditLine: 'Arghamallick5151',
    },
    localizedTitle: '缤纷自然之美',
    localizedDescription: 'Argha Mallick 的自然摄影作品 01',
    promptZh:
      '竖幅近景植物摄影，一株直立分枝的绒状粉紫色花团植物，多个开放绒球花与深红紫色未开花苞沿细枝纵向排列，枝条从画面底部偏中轴向上伸展，周围有暗绿色叶片与后方虚化枝叶，深暗背景带少量金色碎点；逆光侧逆光，花丝边缘透亮如喷绒，前中景清晰，后景压暗融入负空间，粉紫为主色，暗绿与褐红为辅助，明暗对比强，色温偏冷，高细节密度，自然写实质感，画面右下角有淡淡白色文字水印，整体冷艳静谧氛围。宽高比 3:4。',
    promptEn:
      'Vertical close-up nature photograph of an upright branching plant with fluffy pink-purple flower heads, many open pom-pom blossoms and deep red-purple unopened buds arranged vertically along slender stems, stems rising from lower center upward, surrounded by dark green leaves and softly blurred background foliage, dark shadowed background with faint golden specks; backlight and side backlight, filament edges glowing like down, sharp foreground and midground, background falling into negative space, pink-purple dominant with dark green and brown-red accents, strong light-dark contrast, cool color temperature, dense detail, realistic natural texture, subtle white text watermark in the lower right corner, overall cool, quiet and vivid mood. Aspect ratio 3:4.',
    negativePrompt:
      'extra subjects, duplicate flowers, distorted stems, malformed buds, unnatural anatomy, wrong text, gibberish text, watermark outside the intended area, logo, over-sharpening, oversaturated halo, blurry subject, messy background, multiple focal points, cartoon, illustration, oversmooth plastic texture',
  },
  {
    id: 'work-0c5ae80b-8d1d-4750-b0ba-3d0d524b913e',
    title: 'Nature photography by Argha Mallick 02',
    photographerName: 'Arghamallick5151',
    publishedAt: '2026-09-12T09:36:39.892362Z',
    width: 1600,
    height: 2134,
    category: '植物',
    artistStatement: 'Beauty of our colourful Nature',
    imageAnalysis:
      '两张羽状复叶从右上向左下斜伸，在画面中形成一条清晰的对角线骨架。小叶呈红、黄绿渐变，边缘泛红，表面密布水珠，高光点细小锐利。背景压得极暗，仅右下与左下残留模糊的红色碎叶和暗色地面，负空间把主体彻底托出。光线像从上方偏侧打来，叶面湿润，反光柔和，暗部沉得干净。红绿互补几乎撑满整幅，对比浓烈但统一，视觉重心落在中段密集的水珠与叶尖转折处。拍摄距离属于近距离特写，景深浅，边缘裁切略显局促。整体是静物式的冷峻呈现，靠色彩与质感取胜，后期强化了浓色与暗角。',
    attribution: {
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Nature_photography_by_Argha_Mallick_02.jpg',
      licenseName: 'CC BY-SA',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
      creditLine: 'Arghamallick5151',
    },
    localizedTitle: '色彩自然的微观之美',
    localizedDescription: '我们多彩自然之美',
    promptZh:
      '近距离特写两枝羽状复叶从右上向左下斜向延伸，小叶呈红、黄绿渐变，边缘偏红，叶面密布细小的圆形水珠，水珠带有锐利高光；背景深暗近乎黑，右下和左下保留模糊的红色碎叶与暗色地面作为微弱前中景；光线从上方偏侧照射，湿润叶面反光柔和，暗部深重；红绿互补对比强烈，色彩饱和浓郁，暗角收拢视线；浅景深，主体清晰，背景虚化，画面略有压缩质感；整体呈静物式冷峻微距观感。画面宽高比 3:4。',
    promptEn:
      'Close-up of two pinnate compound leaves extending diagonally from upper right to lower left; leaflets transition from red to yellow-green with reddened edges, densely covered in small round water droplets with crisp highlights; background nearly black, with blurred red fallen leaves and dark ground remaining in the lower right and lower left as subtle foreground/midground; light comes from above and slightly to the side, wet leaf surfaces with soft reflections and deep shadows; strong red-green complementary contrast, rich saturated color, vignette drawing the eye inward; shallow depth of field, sharp subject against blurred background, slight compressed texture; overall still-life-like cool macro feel. Aspect ratio 3:4.',
    negativePrompt:
      'extra subjects, duplicate leaves, deformed leaflets, malformed water droplets, incorrect text, watermark, over-sharpening, overexposure, blurry subject, unnatural color banding, floating objects',
  },
  {
    id: 'work-727fb22d-41e0-4d3a-b04c-22f77f319ebf',
    title: 'Kruger National Park (ZA), Giraffe -- 2024 -- 0431',
    photographerName: 'Dietmar Rabich',
    publishedAt: '2026-09-12T09:35:15.127435Z',
    width: 1600,
    height: 2133,
    category: '长颈鹿',
    artistStatement:
      'Giraffe (near the Pretoriuskop–Skukuza Road/Napi Road south of Skukuza), Kruger National Park, Mpumalanga, South Africa\nPlanning for the national park began in the 1890s, when South African bishop Jacob Louis Grobler and other conservationists pushed for the protection of wildlife. In 1898, the area was recognized as a protected area under the administration of the South African government. In 1902/1903, the protected areas of the Kingdom of Swaziland and the region formed the first state-mandated protected area system, which eventually became Kruger National Park. In 1906, major conservation measures came into force to protect wildlife from poaching and hunting. In 1916, the Kruger National Park was formally established by the South African National Parks Act, which designated the park as a state reserve. In the 1920s, the park was opened to visitors. From 1930 onwards, the park continued to grow through the expansion of its territory.',
    imageAnalysis:
      '竖幅画面以长颈鹿的颈与头为主体，躯体下缘与右侧灌木被裁切，形成向上收束的视觉张力。长颈呈斜线由左下向右上延伸，构成引导线，头部回转向右，视线与颈线形成对抗，使重心落在画面上方。背景是均匀的淡蓝天空，负空间辽阔，仅左下与右下保留虚化绿叶，交代环境而不夺主。顺光或轻微侧光下，皮毛暖棕与浅黄网纹层次清晰，边缘鬃毛受光呈金红，蓝天与暖色形成冷暖对比。景深浅，背景柔和虚化，主体锐度与曝光稳定，动态范围控制得当。瞬间安静，属静态肖像，叙事偏弱但观看距离亲切。',
    attribution: {
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Kruger_National_Park_(ZA),_Giraffe_--_2024_--_0431.jpg',
      licenseName: 'CC BY-SA',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
      creditLine: 'Dietmar Rabich',
    },
    localizedTitle: '克鲁格国家公园（南非）长颈鹿——2024——0431',
    localizedDescription:
      '长颈鹿（位于斯库库扎以南的Pretoriuskop–Skukuza路/Napi路附近），克鲁格国家公园，普马兰加省，南非。国家公园的规划始于1890年代，当时南非主教雅各布·路易斯·格罗布勒和其他保护主义者推动对野生动物的保护。1898年，该地区被确认为南非政府管理下的保护区。1902/1903年，斯威士兰王国和该地区的保护区组成了首个国家授权的保护区体系，最终成为克鲁格国家公园。1906年，主要保护措施生效，以保护野生动物免遭偷猎和狩猎。1916年，克鲁格国家公园根据《南非国家公园法》正式建立，该法将该公园指定为国家保护区。1920年代，公园向游客开放。从1930年起，公园通过领土扩张持续增长。',
    promptZh:
      '一只长颈鹿的头部与长颈特写，竖幅构图，主体居中偏左，颈部从左下向右上斜向延伸形成引导线，头部转向画面右侧，耳朵与短角清晰，眼睛湿润有神，口鼻微闭，颈背鬃毛呈金棕色，皮毛为暖棕色底上浅黄白色不规则网纹，皮肤纹理与毛发细节清晰，背景为均匀淡蓝天空，左下角与右下角有虚化绿色灌木枝叶，浅景深，自然顺光，色彩为暖棕与冷蓝对比，写实摄影质感，画面宽高比4:5',
    promptEn:
      "A close-up portrait of a giraffe's head and long neck, vertical composition, subject centered slightly left, neck extending diagonally from lower left to upper right as a leading line, head turned toward the right side of frame, ears and short ossicones clearly visible, moist expressive eye, muzzle slightly closed, golden-brown mane along the back of the neck, coat with warm brown base and pale yellow-white irregular reticulated patches, clear skin texture and hair detail, plain pale blue sky background, blurred green shrub foliage at lower left and lower right corners, shallow depth of field, natural frontal lighting, warm brown and cool blue color contrast, realistic photographic quality, aspect ratio 4:5",
    negativePrompt:
      'extra giraffes, duplicate heads, additional limbs, deformed anatomy, distorted face, malformed ossicones, text, watermark, signature, logo, oversharpening, oversaturated colors, harsh shadows, blown highlights, cluttered background, unnatural skin texture',
  },
  {
    id: 'work-6adb628d-d6ba-455f-8b53-827787041266',
    title: 'Front cover of A Sharp Eye on wildlife photography - Issue Eight',
    photographerName: 'Charles J. Sharp',
    publishedAt: '2026-09-12T09:35:06.777861Z',
    width: 1600,
    height: 2071,
    category: '鹦鹉',
    artistStatement:
      'Front cover of A Sharp Eye on wildlife photography - Issue Eight 2nd Edition. \nThere are pdfs of the publication available, see my User page.',
    imageAnalysis:
      '以竖幅封面呈现，主体是一只彩虹吸蜜鹦鹉，侧身立于斜向延伸的深色枝干上，头部微转朝向画面右侧。鹦鹉偏居左中位置，右侧及下方成簇的橙黄管状花形成呼应，构成对角式视觉动线，把视线从花簇引回鸟眼。背景为大面积失焦的蓝天与模糊枝叶，负空间开阔，让高饱和的绿、橙、红羽色与冷调天空形成鲜明对比。自然光从上方偏侧照入，羽毛与花瓣质地细腻，明暗层次干净。上方与下方叠加出版标题、专辑名与期号，使画面从独立摄影转为杂志封面，观看距离整体拉远；主体对焦清晰，边缘略显紧促。',
    attribution: {
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Front_cover_of_A_Sharp_Eye_on_wildlife_photography_-_Issue_Eight.jpg',
      licenseName: 'CC BY-SA',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
      creditLine: 'Charles J. Sharp',
    },
    localizedTitle: '《锐眼看野生动物摄影》第八期封面',
    localizedDescription:
      '《锐眼看野生动物摄影》第八期第二版封面。该出版物有 PDF 版本，见我的用户页。',
    promptZh:
      '一只彩虹吸蜜鹦鹉侧身栖息在斜向延伸的深色树枝上，头部微转向画面右侧，鸟身位于画面中偏左；树枝从右下向左上延伸，枝上分布多簇橙黄色管状花与绿色叶片，花簇集中在画面右侧与下方；背景为大面积虚化的蓝色天空与模糊枝叶，浅景深；自然光从上方偏侧照入，颜色饱和，绿、橙、红羽色与冷蓝背景形成冷暖对比，细节清晰，整体气质自然明亮；画面上方叠加白、绿、黄、红等彩色杂志标题文字，左侧竖排小字日期与期号；竖幅构图，宽高比 3:4。',
    promptEn:
      'a rainbow lorikeet perched in profile on a dark diagonal branch, head turned slightly toward the right side of the frame, bird positioned slightly left of center; the branch runs from lower right toward upper left, carrying several clusters of orange-yellow tubular flowers and green leaves, flowers concentrated on the right and lower areas; background is a large soft-focus blue sky with blurred foliage, shallow depth of field; natural light from above and slightly to the side, saturated colors, green, orange and red plumage contrasting with the cool blue background, crisp detail, natural bright mood; colorful magazine title text overlaid across the upper area and small vertical date and issue text on the left; vertical composition, aspect ratio 3:4.',
    negativePrompt:
      '额外主体，重复的鸟，多余的花枝，畸形鸟喙，畸形爪子，错误文字，拼写错误，水印，签名，过度锐化，噪点，过曝，欠曝，色彩失真，背景杂乱，多重曝光，画框，边框',
  },
  {
    id: 'work-a746ba31-e147-4080-b554-ad86eb6ea9bf',
    title: '014 Wild Red Deer Switzerland Photo by Giles Laurent',
    photographerName: 'Giles Laurent',
    publishedAt: '2026-09-12T09:34:30.23478Z',
    width: 1600,
    height: 1067,
    category: '野生动物',
    artistStatement: 'Wild red deer in the Aletsch Forest Nature Reserve',
    imageAnalysis:
      '画面以一头雄性红鹿为核心，它立于岩石与林木之间，躯干侧向而头部回望镜头，形成明确的视线交汇。左侧树干、上方枝叶与右侧虚化黄绿枝条共同构成天然框景，将主体稳定在视觉重心偏中位置。前景岩石纹理与枯枝保留细节，中景鹿身皮毛的棕褐层次清晰，后景树干与叶片因景深控制而柔化，形成前后分层。光线为柔和散射自然光，无强烈投影，明暗过渡平缓，色温偏中性，鹿身暖棕与枝叶黄绿形成温和对比。横画幅裁切紧凑，主体完整但未压迫边缘。瞬间安静，鹿的回望带来凝视感，叙事克制。技术完成度较高，焦点准确落在头部与鹿角，背景虚化干净，整体影调统一。',
    attribution: {
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:014_Wild_Red_Deer_Switzerland_Photo_by_Giles_Laurent.jpg',
      licenseName: 'CC BY-SA',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
      creditLine: 'Giles Laurent',
    },
    localizedTitle: '瑞士野生红鹿',
    localizedDescription: '阿莱奇森林自然保护区中的野生红鹿。',
    promptZh:
      '一头雄性红鹿站在多岩石的林地中，身体侧向而头部回望镜头，鹿角修长。画面左侧有一根带粗糙树皮的树干，上方和右侧被黄绿色针叶枝叶环绕，部分枝叶接近镜头形成虚化前景。中景是灰褐色岩石与枯枝，鹿的棕色皮毛有深浅层次，腹侧偏深。背景树干与枝叶柔化，呈现自然散景。光线为柔和的漫射自然光，无强烈阴影，色彩以暖棕与黄绿为主，整体安静自然。横画幅，画面宽高比3:2。',
    promptEn:
      'A male red deer stands among rocky woodland, body angled sideways while its head turns back toward the camera, with long antlers. On the left is a rough-barked tree trunk, and the upper and right areas are framed by yellow-green coniferous branches, with some foliage close to the lens as blurred foreground. The middle ground contains gray-brown rocks and dry twigs; the deer’s brown fur shows layered tones, darker along the belly. Background trunks and leaves are softened into natural bokeh. Soft diffuse natural light, no harsh shadows, warm brown and yellow-green palette, calm and natural atmosphere. Horizontal orientation, aspect ratio 3:2.',
    negativePrompt:
      'extra deer, duplicate animals, extra antlers, distorted anatomy, deformed limbs, malformed head, wrong text, watermark, signature, oversharpened, oversaturated, cartoon, illustration, low detail, blurry subject',
  },
  {
    id: 'work-ece66b30-a867-4c5a-a36a-262260b44272',
    title:
      'Dülmen, Merfeld, Dülmener Wildpferde in der Wildbahn -- 2016 -- 4201',
    photographerName: 'Dietmar Rabich',
    publishedAt: '2026-09-12T09:33:56.270195Z',
    width: 1600,
    height: 1067,
    category: '马群',
    artistStatement:
      'Dülmen ponies in the Wildbahn in the Merfelder Bruch (COE-004) in the morning fog at sunrise, Merfeld, Dülmen, North Rhine-Westphalia, Germany\nThe Dülmen horse is a breed of pony that lives mainly in Dülmen in Westphalia in the Merfelder Bruch. Around 300 to 400 horses live in this fenced-off area, also known as the Wild Horse Trail, largely unaffected by humans. The wild horses of Dülmen were first mentioned in documents in 1316. One of the oldest German horse breeds, originally called Dülmener Brücher, these horses have been listed on the Red List of endangered livestock breeds by the Society for the Preservation of Old and Endangered Domestic Animal Breeds since February 1994. From a biological point of view, the Dülmen horse is not a wild horse. The name refers to its semi-wild lifestyle.',
    imageAnalysis:
      '粉灰晨曦与浓雾压低画面反差，远树以浅影横陈，成为草地与天空之间柔和的分界。中景马群横向铺展，数量成片却无拥挤感，前景两三匹姿态各异：左侧棕马抬头侧立，中部浅色马低头啃草，右侧深色马背对镜头，形成错落的视线落点与呼吸节奏。绿色草场占据下部，提供扎实的前景基座，也把马腿细节融进湿润的暗调。天空从地平线的暖粉渐次向上转淡，大面积负空间让群像得以安静呼吸。光线漫射、无硬边阴影，色温偏冷，材质呈现雾中空气的湿润与草叶的柔韧。整体是远离人类干预的日常瞬间，叙事克制，视觉重心落在中景横向带状马群上，宽画幅强化了原野的开阔与静默。',
    attribution: {
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:D%C3%BClmen,_Merfeld,_D%C3%BClmener_Wildpferde_in_der_Wildbahn_--_2016_--_4201.jpg',
      licenseName: 'CC BY-SA',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
      creditLine: 'Dietmar Rabich',
    },
    localizedTitle: '迪尔门，梅尔费尔德，原野中的迪尔门野马——2016——4201',
    localizedDescription:
      '日出晨雾中的梅尔费尔德布鲁赫原野上的迪尔门矮种马（COE-004），德国北莱茵-威斯特法伦州迪尔门梅尔费尔德。迪尔门马是一种主要生活在威斯特法伦迪尔门梅尔费尔德布鲁赫的矮种马。约300至400匹马生活在这片也被称为“野马小径”的围栏区域内，基本不受人类影响。迪尔门野马最早于1316年在文献中被提及。作为德国最古老的马种之一，最初被称为Dülmener Brücher，自1994年2月起，这些马被古老及濒危家畜品种保护协会列入濒危家畜品种红色名录。从生物学角度看，迪尔门马并非野马。该名称指的是其半野生的生活方式。',
    promptZh:
      '日出时分晨雾笼罩的宽幅自然风景，翠绿草场上约二十余匹半野生矮种马横向散布于中景与前景，浅灰、米白、棕褐与深黑毛色交错。左侧前景一匹棕灰马抬头侧立，中部一匹浅色马低头吃草，右侧前景一匹深色马背对镜头，其旁一匹浅色马与一匹红棕马站立，更远处多匹小马驹与成年马低头或静止。中景上方低矮树丛在浓雾中化成灰蓝剪影，天空由地平线的淡粉过渡到上方的浅白与淡灰。漫射柔和光线，无强烈阴影，湿润草叶质感，低反差，色温偏冷，空气透视明显，整体安静、开阔、半野生自然氛围，宽画幅比例16:9。',
    promptEn:
      'Wide natural landscape at sunrise with morning fog, about twenty semi-wild ponies spread across a lush green meadow in the midground and foreground, in mixed light gray, off-white, brown and dark black coats. In the left foreground a gray-brown horse stands sideways with head raised, in the center a pale horse grazes with head lowered, on the right foreground a dark horse faces away from the camera, beside it a pale horse and a reddish-brown horse stand, and further back several foals and adult horses lower their heads or stand still. Above the midground low trees dissolve into gray-blue silhouettes in thick fog, the sky fades from pale pink at the horizon to whitish and pale gray above. Diffuse soft light, no harsh shadows, moist grass texture, low contrast, cool color temperature, strong atmospheric perspective, quiet, open, semi-wild natural mood, wide aspect ratio 16:9.',
    negativePrompt:
      '额外主体，重复的马，畸形的马腿，多出的肢体，错误的比例，面部扭曲，错误文字，水印，签名，logo，过度锐化，过饱和，过曝，暗部死黑，人工HDR，塑料感，卡通，插画，3D渲染，杂乱构图，主体被裁切不当',
  },
  {
    id: 'work-478174b9-175a-4fe7-bd72-acf5aedd7e4d',
    title: 'Sitta europaea wildlife 3',
    photographerName: 'Paweł Kuźniar (User:Jojo)',
    publishedAt: '2026-09-12T09:33:44.365614Z',
    width: 1600,
    height: 1067,
    category: '生态摄影',
    artistStatement: 'Wildlife photography, Wood Nuthatch (Sitta europaea).',
    imageAnalysis:
      '画面以一只茶腹䴓与摊开的手掌为核心，鸟立于指尖，喙中已衔起一粒葵花籽，掌心还留有一小撮同类种子，构成喂食瞬间的因果链。横向构图里，手掌自左下向中右延伸，鸟身位于右三分区，身体与尾羽朝右下倾斜，视线和喙尖指向左上，形成对角呼应的视觉动线，重心落在鸟眼与种子相接处。浅景深将背景化为大片暖橙光斑，负空间干净，衬托出鸟羽的灰蓝背、橙褐腹与黑色贯眼纹。光线为柔和逆光，边缘微透亮，肤色调与羽色同属暖域，明暗过渡自然。整体瞬间自然、节奏安静，技术完成度较高，边缘清晰度略松，但叙事完整。',
    attribution: {
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Sitta_europaea_wildlife_3.jpg',
      licenseName: 'CC BY-SA',
      licenseUrl: 'http://creativecommons.org/licenses/by-sa/3.0/',
      creditLine: 'Paweł Kuźniar (User:Jojo)',
    },
    localizedTitle: 'Sitta europaea 野生动物 3',
    localizedDescription: '野生动物摄影，Wood Nuthatch（Sitta europaea）。',
    promptZh:
      '一只茶腹䴓站在一只摊开的左手掌边缘，鸟喙中衔着一粒葵花籽，掌心放着一小撮葵花籽；鸟身位于画面右侧，身体与尾羽朝右下倾斜，头部和喙朝左上方，手掌从画面左下方向中右延伸。浅景深，背景为大片暖橙色圆形光斑，隐约有深色树干轮廓，前景清晰。侧面平视视角，横向构图，鸟眼与种子为焦点。柔和逆光，鸟背呈灰蓝色，腹部橙褐色，脸部有黑色贯眼纹，白色喉部，手掌肤色自然偏暖。整体色调温暖、安静、自然。画面宽高比 3:2。',
    promptEn:
      "A wood nuthatch perched on the edge of an open left hand, holding a sunflower seed in its beak, with a small pile of sunflower seeds resting in the palm; the bird is on the right side of the frame, body and tail angled toward the lower right, head and beak pointing upper left, and the hand extends from the lower left toward the center right. Shallow depth of field, background filled with large warm orange circular bokeh, faint dark tree trunk silhouette, foreground sharp. Eye-level side view, horizontal composition, focus on the bird's eye and the seed. Soft backlight, gray-blue back, orange-brown underparts, black eye stripe, white throat, naturally warm skin tones. Warm, quiet, natural overall mood. Aspect ratio 3:2.",
    negativePrompt:
      'extra subjects, duplicate birds, extra hands, deformed hands, extra fingers, malformed beak, distorted feet, floating objects, wrong text, watermark, signature, oversharpening, unnatural bokeh, harsh HDR, oversaturated colors',
  },
  {
    id: 'work-df46432c-a11b-4e9f-9129-97b51bc242df',
    title: 'Deer-wildlife-photography-in-kerala',
    photographerName: 'Priyaariyani1982',
    publishedAt: '2026-09-12T09:33:34.103087Z',
    width: 1600,
    height: 1200,
    category: '野生动物',
    artistStatement: 'Wildlife photography in Kerala',
    imageAnalysis:
      '画面以两株深色树干在左右形成竖框，把视线引向中景偏下的鹿。鹿立于高草丛中，身体侧转、头部回望镜头，形成直接对视，成为唯一视觉重心。前景草叶明显虚化，构成柔和负空间，中景草丛清晰，背景草坡与树干层层后退，景深控制得当。漫射柔光自上方洒落，树皮暗部纹理粗粝，草地亮部保留层次，色温偏冷绿，明暗过渡自然。鹿角与深色树干形成细密线条的重复节奏，平静中带窥视感。技术完成度稳健，主体清晰但体量较小，细节有限，属近距离生态记录的克制处理。',
    attribution: {
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Deer-wildlife-photography-in-kerala.jpg',
      licenseName: 'CC BY-SA',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
      creditLine: 'Priyaariyani1982',
    },
    localizedTitle: '喀拉拉邦的野生动物摄影',
    localizedDescription: '喀拉拉的野生动物摄影',
    promptZh:
      '竖幅林间野生动物摄影。两株深色粗皮树干在画面左右两侧形成竖框，中景偏下位置有一只带分叉鹿角的鹿站在茂密高草中，身体侧转、头部回望镜头。前景草叶明显虚化成柔和绿色负空间，中景草丛清晰，背景为绿色草坡与后退的树干。整体色调统一偏冷绿，漫射柔光自上而下，树皮暗部纹理粗粝，草地亮部层次保留。自然纪实风格，细节密度中等，安静隐秘的窥视感。画面宽高比约为 3:4。',
    promptEn:
      'Vertical wildlife photograph in a forest. Two thick dark-barked tree trunks frame the left and right sides, and a deer with branching antlers stands in tall dense grass in the lower-middle ground, body turned sideways with head looking back toward the camera. Foreground grass blades are softly blurred into a green negative space, midground grass is sharp, and the background shows a green grassy slope with receding trunks. Overall palette is unified cool green, with soft diffused light from above, rough bark texture in shadow, and preserved highlight layers in the grass. Natural documentary style, medium detail density, quiet secretive peeking mood. Aspect ratio approximately 3:4.',
    negativePrompt:
      'extra animals, duplicate deer, additional antlers, malformed anatomy, distorted limbs, wrong reflection, text, watermark, logo, signature, oversharpening, excessive HDR, plastic texture, blurry subject, oversaturated colors',
  },
  {
    id: 'work-c7ef5f0e-eb2c-4a9c-9f1a-53ea3b68141a',
    title: 'Kruger National Park (ZA), Elefant -- 2024 -- 0649',
    photographerName: 'Dietmar Rabich',
    publishedAt: '2026-09-12T09:33:25.877495Z',
    width: 1600,
    height: 1067,
    category: '大象',
    artistStatement:
      'Elephant in the dry riverbed of the Mutlumuvi River, Kruger National Park, Mpumalanga, South Africa\nPlanning for the national park began in the 1890s, when South African bishop Jacob Louis Grobler and other conservationists pushed for the protection of wildlife. In 1898, the area was recognized as a protected area under the administration of the South African government. In 1902/1903, the protected areas of the Kingdom of Swaziland and the region formed the first state-mandated protected area system, which eventually became Kruger National Park. In 1906, major conservation measures came into force to protect wildlife from poaching and hunting. In 1916, the Kruger National Park was formally established by the South African National Parks Act, which designated the park as a state reserve. In the 1920s, the park was opened to visitors. From 1930 onwards, the park continued to grow through the expansion of its territory.',
    imageAnalysis:
      '画面以横向构图框取一头独象，它占据中景偏右位置，身体侧对镜头，长鼻上卷，正将沙土抛向背部。右侧扬起的沙弧与鼻端形成一条斜向引导线，把视线从干燥的前景沙地引向主体，并延伸至背景的绿色灌木。前景沙地占据下缘，与中景草簇构成层次；背景树丛密集，压缩了纵深感，但象身与植被的明暗反差把主体推前。光线来自上方偏侧，属硬质日光，象皮褶皱和溅落的沙粒质感清晰，色温偏暖。灰褐象身、金黄沙土与深绿植被形成低饱和的色调对比，动态瞬间被定格在沙粒散开的刹那。整体技术完成度稳定，焦点准确，曝光克制，属于中远距离的生态行为记录。',
    attribution: {
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Kruger_National_Park_(ZA),_Elefant_--_2024_--_0649.jpg',
      licenseName: 'CC BY-SA',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
      creditLine: 'Dietmar Rabich',
    },
    localizedTitle: '克鲁格国家公园（南非），大象——2024——0649',
    localizedDescription:
      '大象位于穆特鲁穆维河干涸的河床中，南非姆普马兰加省克鲁格国家公园。国家公园的规划始于19世纪90年代，当时南非主教雅各布·路易斯·格罗布勒和其他保护主义者推动保护野生动物。1898年，该地区被承认为南非政府管理下的保护区。1902/1903年，斯威士兰王国保护区和该地区组成了第一个国家授权的保护区系统，最终成为克鲁格国家公园。1906年，主要保护措施生效，以保护野生动物免遭偷猎和狩猎。1916年，克鲁格国家公园根据南非国家公园法案正式建立，该法案将该公园指定为国家保护区。20世纪20年代，公园向游客开放。从1930年起，公园通过领土扩张继续发展。',
    promptZh:
      '横向构图，一头成年大象站在干涸河床的沙地上，身体侧对镜头，长鼻向上卷起，正向背部抛洒沙土。大象位于中景偏右，深灰褐色皮肤布满皱纹，可见短象牙。前景是浅黄色沙地和稀疏绿草，中景有散落草簇，背景是茂密的绿色灌木和树丛。上方偏侧硬光，沙粒在空中形成弧线，色调偏暖，灰褐、金黄与深绿自然过渡。自然纪实风格，焦点清晰，景深从前景沙地延伸到背景植被，画面宽高比 3:2。',
    promptEn:
      'Horizontal composition, a single adult elephant standing on the sandy bed of a dry river, body in profile facing right, trunk curled upward and tossing sand onto its back. The elephant is positioned slightly right of center in the midground, with dark gray-brown wrinkled skin and short visible tusks. Foreground is pale yellow sand with sparse green grass, midground has scattered grass tufts, background is dense green shrubs and trees. Hard light from above and slightly to the side, sand particles forming an arc in the air, warm color temperature, natural transition between gray-brown, golden yellow, and deep green. Natural documentary style, sharp focus, depth of field extending from foreground sand to background vegetation, aspect ratio 3:2.',
    negativePrompt:
      'extra elephants, duplicate animals, cropped limbs, distorted trunk, deformed tusks, human figures, text, watermark, logo, oversharpened edges, oversaturated colors, artificial lighting, plastic skin texture, floating objects, unnatural sand trails, blurry subject',
  },
] as const;

// Keep every tag from the backend snapshot searchable in local/demo mode. The
// compact WorkDetail model intentionally exposes only the primary category,
// but the static gallery should behave like the live catalogue when searching.
export const fixtureSearchTags: Readonly<Record<string, readonly string[]>> = {
  'work-3f002a09-3fd2-455e-8db0-95c1c8cff716': ['嫩叶', '树皮', '暗调', '蓝光', '微距', '特写'],
  'work-aa06bfa3-728c-4a8c-b749-0aaf77c8cc96': ['鸟类', '生态摄影', '侧身', '虚化背景', '高饱和', '竖幅'],
  'work-852ba582-c184-4b28-94ab-2973a990c618': ['自动售货机', '并置', '镜像', '野生动物', '可口可乐', '街头'],
  'work-f31988b5-8098-49ea-bb8f-faadf68cbffb': ['竖幅', '椰林', '天空', '小路', '对称', '热带', '风光'],
  'work-baa7432e-6609-45c9-b88f-0f8301707255': ['马群', '逆光', '林间', '草地', '光束', '横画幅', '暖色调'],
  'work-dade41a4-559e-4b5b-8030-5352f97f76dc': ['枯枝', '球形花序', '浅景深', '暖调', '竖幅', '自然微观', '虚实对比'],
  'work-fef7c1fc-4e39-4437-9915-f652f65d4db8': ['枯叶', '逆光', '浅景深', '暖橙色调', '自然', '竖幅'],
  'work-2d3b78b1-afb9-48f9-8a97-a036514b30c2': ['猛禽', '生态摄影', '横构图', '绿色背景', '虚化光斑', '自然光', '枝干'],
  'work-4a477a1e-a2e3-4edc-b581-5830afba1dc6': ['植物', '干花', '放射构图', '浅景深', '暖色调', '微距', '冬季'],
  'work-ee98fa87-ccff-4888-998b-c05c740d713d': ['植物微距', '干枯花序', '暖色调', '浅景深', '密集肌理', '横画幅'],
  'work-2d89851a-de98-42f6-bde3-39fbc88f08bd': ['人物', '森林', '伪装服', '逆光', '竖幅', '绿色'],
  'work-3b318f84-027a-4dda-b384-89ecb40eefb9': ['植物', '粉紫色调', '深色背景', '竖构图', '线条', '花苞', '氛围'],
  'work-0c5ae80b-8d1d-4750-b0ba-3d0d524b913e': ['植物', '水珠', '红叶', '绿叶', '暗背景', '对角线构图', '竖幅'],
  'work-727fb22d-41e0-4d3a-b04c-22f77f319ebf': ['长颈鹿', '动物', '竖幅', '蓝天', '棕白斑纹'],
  'work-6adb628d-d6ba-455f-8b53-827787041266': ['鹦鹉', '花枝', '竖幅', '蓝天背景', '色彩对比', '生态摄影', '自然光'],
  'work-a746ba31-e147-4080-b554-ad86eb6ea9bf': ['野生动物', '雄鹿', '生态摄影', '虚化前景', '岩石', '自然光', '横画幅'],
  'work-ece66b30-a867-4c5a-a36a-262260b44272': ['马群', '晨雾', '草原', '粉色天空', '宽画幅', '自然', '群像'],
  'work-478174b9-175a-4fe7-bd72-acf5aedd7e4d': ['生态摄影', '喂食瞬间', '暖色调', '浅景深', '横向构图', '手与鸟'],
  'work-df46432c-a11b-4e9f-9129-97b51bc242df': ['野生动物', '鹿', '林间', '框景', '纵深', '绿调', '竖幅'],
  'work-c7ef5f0e-eb2c-4a9c-9f1a-53ea3b68141a': ['大象', '野生动物', '扬沙', '自然', '横向构图', '绿色背景'],
};

export const dailyFixtureWorkIDs = [
  'work-2d3b78b1-afb9-48f9-8a97-a036514b30c2',
  'work-478174b9-175a-4fe7-bd72-acf5aedd7e4d',
  'work-a746ba31-e147-4080-b554-ad86eb6ea9bf',
  'work-6adb628d-d6ba-455f-8b53-827787041266',
  'work-c7ef5f0e-eb2c-4a9c-9f1a-53ea3b68141a',
  'work-df46432c-a11b-4e9f-9129-97b51bc242df',
  'work-aa06bfa3-728c-4a8c-b749-0aaf77c8cc96',
  'work-baa7432e-6609-45c9-b88f-0f8301707255',
  'work-ece66b30-a867-4c5a-a36a-262260b44272',
  'work-852ba582-c184-4b28-94ab-2973a990c618',
  'work-dade41a4-559e-4b5b-8030-5352f97f76dc',
  'work-f31988b5-8098-49ea-bb8f-faadf68cbffb',
] as const;

export const workFixtures: WorkDetail[] = snapshotRecords.map(
  (record, index) => {
    const { width, height, ...work } = record;
    const image = {
      src: `/art/demo/${String(index + 1).padStart(2, '0')}.webp`,
      width,
      height,
      alt: `${work.title} by ${work.photographerName}`,
    };
    return {
      ...work,
      thumbnail: image,
      image,
    };
  },
);
