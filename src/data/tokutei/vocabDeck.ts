/**
 * Bộ từ vựng Tokutei Ginou chuẩn — nguồn dữ liệu trung tâm cho Flashcard SRS,
 * trang chi tiết từ vựng, tìm kiếm và thống kê.
 *
 * Mỗi thẻ có chữ Nhật thật (kanji/kana) + cách đọc kana + romaji + nghĩa Việt
 * + câu ví dụ ngữ cảnh công việc thực tế.
 */

export type TokuteiTopicId =
  | 'aisatsu'
  | 'shokuba'
  | 'hourensou'
  | 'anzen'
  | 'shorui'
  | 'mensetsu'
  | 'seikatsu'
  | 'jikan';

export interface TokuteiTopic {
  id: TokuteiTopicId;
  label: string;
  description: string;
  tone: 'orange' | 'blue' | 'emerald' | 'violet' | 'pink' | 'amber' | 'sky' | 'rose';
}

export interface TokuteiVocabCard {
  id: string;
  /** Chữ Nhật hiển thị chính (kanji hoặc kana) */
  word: string;
  /** Cách đọc bằng kana (furigana) */
  reading: string;
  /** Phiên âm romaji cho người mới */
  romaji: string;
  /** Nghĩa tiếng Việt */
  meaning: string;
  /** Câu ví dụ tiếng Nhật */
  exampleJp: string;
  /** Romaji của câu ví dụ */
  exampleRomaji: string;
  /** Dịch nghĩa câu ví dụ */
  exampleVi: string;
  topicId: TokuteiTopicId;
  level: string;
}

export const TOKUTEI_TOPICS: TokuteiTopic[] = [
  { id: 'aisatsu', label: 'Chào hỏi & lịch sự', description: 'Các câu chào và cụm lịch sự dùng mỗi ngày ở nơi làm việc.', tone: 'orange' },
  { id: 'shokuba', label: 'Nơi làm việc', description: 'Con người, ca kíp và những từ sống còn trong môi trường làm việc.', tone: 'sky' },
  { id: 'hourensou', label: 'Báo cáo & quy trình', description: 'Hō-Ren-Sō: báo cáo, liên lạc, trao đổi — tác phong chuẩn Nhật.', tone: 'emerald' },
  { id: 'anzen', label: 'An toàn lao động', description: 'Cảnh báo, thiết bị bảo hộ và tình huống khẩn cấp.', tone: 'rose' },
  { id: 'shorui', label: 'Hồ sơ & giấy tờ', description: 'Giấy tờ tùy thân, hợp đồng, bảo hiểm — thủ tục khi sang Nhật.', tone: 'violet' },
  { id: 'mensetsu', label: 'Phỏng vấn', description: 'Từ khóa để trả lời phỏng vấn Tokutei tự tin và đúng trọng tâm.', tone: 'amber' },
  { id: 'seikatsu', label: 'Cuộc sống ở Nhật', description: 'Đi lại, mua sắm, bệnh viện — sinh hoạt hằng ngày.', tone: 'blue' },
  { id: 'jikan', label: 'Thời gian & lịch làm', description: 'Giờ giấc, lịch hẹn và deadline — người Nhật rất coi trọng.', tone: 'pink' },
];

const LEVEL_BY_TOPIC: Record<TokuteiTopicId, string> = {
  aisatsu: 'JFT Basic',
  shokuba: 'Tokutei Core',
  hourensou: 'Tokutei Core',
  anzen: 'Tokutei Core',
  shorui: 'Hồ sơ',
  mensetsu: 'Phỏng vấn',
  seikatsu: 'JFT Basic',
  jikan: 'JFT Basic',
};

type CardSeed = [
  id: string,
  word: string,
  reading: string,
  romaji: string,
  meaning: string,
  exampleJp: string,
  exampleRomaji: string,
  exampleVi: string,
];

function buildCards(topicId: TokuteiTopicId, seeds: CardSeed[]): TokuteiVocabCard[] {
  return seeds.map(([id, word, reading, romaji, meaning, exampleJp, exampleRomaji, exampleVi]) => ({
    id,
    word,
    reading,
    romaji,
    meaning,
    exampleJp,
    exampleRomaji,
    exampleVi,
    topicId,
    level: LEVEL_BY_TOPIC[topicId],
  }));
}

const AISATSU: CardSeed[] = [
  ['aisatsu', '挨拶', 'あいさつ', 'aisatsu', 'chào hỏi', '出勤したら、まず挨拶をします。', 'Shukkin shitara, mazu aisatsu o shimasu.', 'Đến chỗ làm thì việc đầu tiên là chào hỏi.'],
  ['ohayou-gozaimasu', 'おはようございます', 'おはようございます', 'ohayou gozaimasu', 'chào buổi sáng', 'おはようございます。今日もよろしくお願いします。', 'Ohayou gozaimasu. Kyou mo yoroshiku onegaishimasu.', 'Chào buổi sáng. Hôm nay cũng mong mọi người giúp đỡ.'],
  ['otsukaresama', 'お疲れ様です', 'おつかれさまです', 'otsukaresama desu', 'anh/chị vất vả rồi (chào ở chỗ làm)', '仕事が終わったら「お疲れ様です」と言います。', 'Shigoto ga owattara "otsukaresama desu" to iimasu.', 'Khi xong việc thì nói "otsukaresama desu".'],
  ['yoroshiku', 'よろしくお願いします', 'よろしくおねがいします', 'yoroshiku onegaishimasu', 'rất mong được giúp đỡ', '初めまして。よろしくお願いします。', 'Hajimemashite. Yoroshiku onegaishimasu.', 'Rất vui được gặp. Mong được anh/chị giúp đỡ.'],
  ['sumimasen', 'すみません', 'すみません', 'sumimasen', 'xin lỗi / cho tôi hỏi', 'すみません、もう一度お願いします。', 'Sumimasen, mou ichido onegaishimasu.', 'Xin lỗi, nhờ anh/chị nhắc lại một lần nữa.'],
  ['arigatou', 'ありがとうございます', 'ありがとうございます', 'arigatou gozaimasu', 'cảm ơn', '教えてくれて、ありがとうございます。', 'Oshiete kurete, arigatou gozaimasu.', 'Cảm ơn anh/chị đã chỉ cho em.'],
  ['shitsurei-shimasu', '失礼します', 'しつれいします', 'shitsurei shimasu', 'xin phép (khi vào/ra phòng)', '部屋に入る時、「失礼します」と言います。', 'Heya ni hairu toki, "shitsurei shimasu" to iimasu.', 'Khi vào phòng thì nói "shitsurei shimasu".'],
  ['onegaishimasu', 'お願いします', 'おねがいします', 'onegaishimasu', 'xin nhờ anh/chị', 'チェックをお願いします。', 'Chekku o onegaishimasu.', 'Nhờ anh/chị kiểm tra giúp em.'],
  ['daijoubu', '大丈夫', 'だいじょうぶ', 'daijoubu', 'không sao, ổn', '大丈夫です。問題ありません。', 'Daijoubu desu. Mondai arimasen.', 'Không sao ạ. Không có vấn đề gì.'],
  ['wakarimashita', '分かりました', 'わかりました', 'wakarimashita', 'em hiểu rồi', 'はい、分かりました。すぐやります。', 'Hai, wakarimashita. Sugu yarimasu.', 'Vâng, em hiểu rồi. Em làm ngay ạ.'],
  ['mou-ichido', 'もう一度', 'もういちど', 'mou ichido', 'một lần nữa', 'すみません、もう一度言ってください。', 'Sumimasen, mou ichido itte kudasai.', 'Xin lỗi, anh/chị nói lại giúp em một lần nữa.'],
  ['osaki-ni', 'お先に失礼します', 'おさきにしつれいします', 'osaki ni shitsurei shimasu', 'em xin phép về trước', 'お先に失礼します。また明日。', 'Osaki ni shitsurei shimasu. Mata ashita.', 'Em xin phép về trước. Hẹn mai gặp lại.'],
];

const SHOKUBA: CardSeed[] = [
  ['shigoto', '仕事', 'しごと', 'shigoto', 'công việc', '日本で仕事をしたいです。', 'Nihon de shigoto o shitai desu.', 'Em muốn làm việc ở Nhật.'],
  ['shokuba', '職場', 'しょくば', 'shokuba', 'nơi làm việc', '職場のルールを守ります。', 'Shokuba no ruuru o mamorimasu.', 'Em tuân thủ nội quy nơi làm việc.'],
  ['tenchou', '店長', 'てんちょう', 'tenchou', 'quản lý cửa hàng', '店長に報告してください。', 'Tenchou ni houkoku shite kudasai.', 'Hãy báo cáo với quản lý cửa hàng.'],
  ['joushi', '上司', 'じょうし', 'joushi', 'cấp trên', '上司の指示を聞きます。', 'Joushi no shiji o kikimasu.', 'Nghe chỉ thị của cấp trên.'],
  ['douryou', '同僚', 'どうりょう', 'douryou', 'đồng nghiệp', '同僚と協力して働きます。', 'Douryou to kyouryoku shite hatarakimasu.', 'Làm việc phối hợp với đồng nghiệp.'],
  ['senpai', '先輩', 'せんぱい', 'senpai', 'tiền bối, người vào trước', '先輩に仕事を教えてもらいます。', 'Senpai ni shigoto o oshiete moraimasu.', 'Được tiền bối chỉ việc cho.'],
  ['kyuukei', '休憩', 'きゅうけい', 'kyuukei', 'giờ nghỉ giải lao', '12時から休憩です。', 'Juuniji kara kyuukei desu.', 'Từ 12 giờ là giờ nghỉ.'],
  ['zangyou', '残業', 'ざんぎょう', 'zangyou', 'làm thêm giờ', '今日は残業があります。', 'Kyou wa zangyou ga arimasu.', 'Hôm nay có làm thêm giờ.'],
  ['kyuuryou', '給料', 'きゅうりょう', 'kyuuryou', 'tiền lương', '給料は銀行に振り込まれます。', 'Kyuuryou wa ginkou ni furikomaremasu.', 'Lương được chuyển vào tài khoản ngân hàng.'],
  ['shifuto', 'シフト', 'シフト', 'shifuto', 'ca làm việc', '来週のシフトを確認します。', 'Raishuu no shifuto o kakunin shimasu.', 'Kiểm tra ca làm tuần sau.'],
  ['chikoku', '遅刻', 'ちこく', 'chikoku', 'đi muộn', '遅刻する時は、必ず連絡します。', 'Chikoku suru toki wa, kanarazu renraku shimasu.', 'Khi đi muộn, nhất định phải liên lạc.'],
  ['soutai', '早退', 'そうたい', 'soutai', 'về sớm', '体調が悪いので、早退します。', 'Taichou ga warui node, soutai shimasu.', 'Vì không khỏe nên em xin về sớm.'],
  ['kekkin', '欠勤', 'けっきん', 'kekkin', 'nghỉ làm (vắng mặt)', '欠勤の時は、朝早く連絡してください。', 'Kekkin no toki wa, asa hayaku renraku shite kudasai.', 'Khi nghỉ làm, hãy liên lạc sớm vào buổi sáng.'],
  ['shukkin', '出勤', 'しゅっきん', 'shukkin', 'đi làm, vào ca', '明日は8時に出勤します。', 'Ashita wa hachiji ni shukkin shimasu.', 'Ngày mai em vào ca lúc 8 giờ.'],
];

const HOURENSOU: CardSeed[] = [
  ['houkoku', '報告', 'ほうこく', 'houkoku', 'báo cáo', '問題があれば、すぐ報告します。', 'Mondai ga areba, sugu houkoku shimasu.', 'Nếu có vấn đề thì báo cáo ngay.'],
  ['renraku', '連絡', 'れんらく', 'renraku', 'liên lạc', '遅れる時は、電話で連絡します。', 'Okureru toki wa, denwa de renraku shimasu.', 'Khi đến muộn thì gọi điện liên lạc.'],
  ['soudan', '相談', 'そうだん', 'soudan', 'trao đổi, hỏi ý kiến', '困った時は、先輩に相談します。', 'Komatta toki wa, senpai ni soudan shimasu.', 'Khi gặp khó khăn thì hỏi ý kiến tiền bối.'],
  ['kakunin', '確認', 'かくにん', 'kakunin', 'kiểm tra, xác nhận', '作業の前に、確認をお願いします。', 'Sagyou no mae ni, kakunin o onegaishimasu.', 'Trước khi thao tác, nhờ anh/chị xác nhận giúp.'],
  ['junbi', '準備', 'じゅんび', 'junbi', 'chuẩn bị', '開店の準備をします。', 'Kaiten no junbi o shimasu.', 'Chuẩn bị mở cửa hàng.'],
  ['shiji', '指示', 'しじ', 'shiji', 'chỉ thị, hướng dẫn', '指示をよく聞いてから、始めます。', 'Shiji o yoku kiite kara, hajimemasu.', 'Nghe kỹ chỉ thị rồi mới bắt đầu.'],
  ['sagyou', '作業', 'さぎょう', 'sagyou', 'thao tác, công đoạn', 'この作業は二人でやります。', 'Kono sagyou wa futari de yarimasu.', 'Công đoạn này làm hai người.'],
  ['seiri-seiton', '整理整頓', 'せいりせいとん', 'seiri seiton', 'sắp xếp gọn gàng (5S)', '整理整頓を忘れないでください。', 'Seiri seiton o wasurenaide kudasai.', 'Đừng quên sắp xếp mọi thứ gọn gàng.'],
  ['souji', '掃除', 'そうじ', 'souji', 'dọn dẹp, vệ sinh', '帰る前に掃除をします。', 'Kaeru mae ni souji o shimasu.', 'Trước khi về thì dọn dẹp.'],
  ['tejun', '手順', 'てじゅん', 'tejun', 'trình tự các bước', '手順どおりに作業してください。', 'Tejun doori ni sagyou shite kudasai.', 'Hãy thao tác đúng theo trình tự.'],
  ['okuremasu', '遅れます', 'おくれます', 'okuremasu', '(sẽ) đến muộn', 'すみません、10分遅れます。', 'Sumimasen, juppun okuremasu.', 'Xin lỗi, em đến muộn 10 phút.'],
  ['yasumimasu', '休みます', 'やすみます', 'yasumimasu', 'xin nghỉ', '熱があるので、今日は休みます。', 'Netsu ga aru node, kyou wa yasumimasu.', 'Vì bị sốt nên hôm nay em xin nghỉ.'],
];

const ANZEN: CardSeed[] = [
  ['anzen', '安全', 'あんぜん', 'anzen', 'an toàn', '安全第一で作業しましょう。', 'Anzen daiichi de sagyou shimashou.', 'Hãy làm việc với tinh thần an toàn là trên hết.'],
  ['kiken', '危険', 'きけん', 'kiken', 'nguy hiểm', 'ここは危険です。入らないでください。', 'Koko wa kiken desu. Hairanaide kudasai.', 'Chỗ này nguy hiểm. Xin đừng vào.'],
  ['jiko', '事故', 'じこ', 'jiko', 'tai nạn, sự cố', '事故があったら、すぐ知らせてください。', 'Jiko ga attara, sugu shirasete kudasai.', 'Nếu có tai nạn, hãy báo ngay.'],
  ['kega', '怪我', 'けが', 'kega', 'bị thương, vết thương', '怪我をしたら、まず報告してください。', 'Kega o shitara, mazu houkoku shite kudasai.', 'Nếu bị thương, trước tiên hãy báo cáo.'],
  ['chuui', '注意', 'ちゅうい', 'chuui', 'chú ý, cẩn thận', '足元に注意してください。', 'Ashimoto ni chuui shite kudasai.', 'Hãy chú ý bước chân.'],
  ['kinshi', '禁止', 'きんし', 'kinshi', 'cấm', 'ここでタバコは禁止です。', 'Koko de tabako wa kinshi desu.', 'Ở đây cấm hút thuốc.'],
  ['hijouguchi', '非常口', 'ひじょうぐち', 'hijouguchi', 'cửa thoát hiểm', '非常口の場所を確認しておきます。', 'Hijouguchi no basho o kakunin shite okimasu.', 'Kiểm tra trước vị trí cửa thoát hiểm.'],
  ['kaji', '火事', 'かじ', 'kaji', 'hỏa hoạn', '火事の時は、119番に電話します。', 'Kaji no toki wa, hyakujuukyuu-ban ni denwa shimasu.', 'Khi có hỏa hoạn, gọi số 119.'],
  ['jishin', '地震', 'じしん', 'jishin', 'động đất', '地震の時は、机の下に入ります。', 'Jishin no toki wa, tsukue no shita ni hairimasu.', 'Khi động đất, chui xuống gầm bàn.'],
  ['kyuukyuusha', '救急車', 'きゅうきゅうしゃ', 'kyuukyuusha', 'xe cấp cứu', '救急車を呼んでください。', 'Kyuukyuusha o yonde kudasai.', 'Hãy gọi xe cấp cứu.'],
  ['herumetto', 'ヘルメット', 'ヘルメット', 'herumetto', 'mũ bảo hộ', '現場ではヘルメットをかぶります。', 'Genba de wa herumetto o kaburimasu.', 'Ở công trường phải đội mũ bảo hộ.'],
  ['tebukuro', '手袋', 'てぶくろ', 'tebukuro', 'găng tay', '作業の時は手袋をします。', 'Sagyou no toki wa tebukuro o shimasu.', 'Khi thao tác thì đeo găng tay.'],
];

const SHORUI: CardSeed[] = [
  ['zairyu-card', '在留カード', 'ざいりゅうカード', 'zairyuu kaado', 'thẻ cư trú', '在留カードをいつも持っています。', 'Zairyuu kaado o itsumo motte imasu.', 'Luôn mang theo thẻ cư trú bên mình.'],
  ['pasupooto', 'パスポート', 'パスポート', 'pasupooto', 'hộ chiếu', 'パスポートをコピーしてください。', 'Pasupooto o kopii shite kudasai.', 'Hãy photo hộ chiếu.'],
  ['rirekisho', '履歴書', 'りれきしょ', 'rirekisho', 'sơ yếu lý lịch', '履歴書を書いて、送ります。', 'Rirekisho o kaite, okurimasu.', 'Viết sơ yếu lý lịch rồi gửi đi.'],
  ['shorui', '書類', 'しょるい', 'shorui', 'giấy tờ, tài liệu', '書類にサインをお願いします。', 'Shorui ni sain o onegaishimasu.', 'Nhờ anh/chị ký vào giấy tờ.'],
  ['moushikomi', '申込み', 'もうしこみ', 'moushikomi', 'đăng ký, nộp đơn', '試験の申込みは金曜日までです。', 'Shiken no moushikomi wa kinyoubi made desu.', 'Hạn đăng ký thi là đến thứ Sáu.'],
  ['keiyaku', '契約', 'けいやく', 'keiyaku', 'hợp đồng', '契約の内容をよく読んでください。', 'Keiyaku no naiyou o yoku yonde kudasai.', 'Hãy đọc kỹ nội dung hợp đồng.'],
  ['hoken', '保険', 'ほけん', 'hoken', 'bảo hiểm', '保険に入っていますか。', 'Hoken ni haitte imasu ka.', 'Anh/chị đã tham gia bảo hiểm chưa?'],
  ['zeikin', '税金', 'ぜいきん', 'zeikin', 'thuế', '給料から税金が引かれます。', 'Kyuuryou kara zeikin ga hikaremasu.', 'Thuế được trừ từ lương.'],
  ['ginkou-kouza', '銀行口座', 'ぎんこうこうざ', 'ginkou kouza', 'tài khoản ngân hàng', '銀行口座を作りたいです。', 'Ginkou kouza o tsukuritai desu.', 'Em muốn mở tài khoản ngân hàng.'],
  ['juusho', '住所', 'じゅうしょ', 'juusho', 'địa chỉ', '新しい住所を書いてください。', 'Atarashii juusho o kaite kudasai.', 'Hãy viết địa chỉ mới.'],
  ['inkan', '印鑑', 'いんかん', 'inkan', 'con dấu cá nhân', '印鑑を持ってきてください。', 'Inkan o motte kite kudasai.', 'Hãy mang con dấu cá nhân đến.'],
  ['shashin', '写真', 'しゃしん', 'shashin', 'ảnh (thẻ)', '履歴書用の写真を撮ります。', 'Rirekisho-you no shashin o torimasu.', 'Chụp ảnh để dán sơ yếu lý lịch.'],
];

const MENSETSU: CardSeed[] = [
  ['mensetsu', '面接', 'めんせつ', 'mensetsu', 'phỏng vấn', '明日、面接があります。', 'Ashita, mensetsu ga arimasu.', 'Ngày mai em có buổi phỏng vấn.'],
  ['jikoshoukai', '自己紹介', 'じこしょうかい', 'jikoshoukai', 'tự giới thiệu', '短く自己紹介をお願いします。', 'Mijikaku jikoshoukai o onegaishimasu.', 'Mời bạn tự giới thiệu ngắn gọn.'],
  ['shibou-douki', '志望動機', 'しぼうどうき', 'shibou douki', 'lý do ứng tuyển', '志望動機を教えてください。', 'Shibou douki o oshiete kudasai.', 'Hãy cho biết lý do ứng tuyển.'],
  ['keiken', '経験', 'けいけん', 'keiken', 'kinh nghiệm', 'レストランで働いた経験があります。', 'Resutoran de hataraita keiken ga arimasu.', 'Em có kinh nghiệm làm việc ở nhà hàng.'],
  ['shikaku', '資格', 'しかく', 'shikaku', 'chứng chỉ, bằng cấp', '日本語の資格を持っています。', 'Nihongo no shikaku o motte imasu.', 'Em có chứng chỉ tiếng Nhật.'],
  ['chousho', '長所', 'ちょうしょ', 'chousho', 'điểm mạnh', '長所は真面目なところです。', 'Chousho wa majime na tokoro desu.', 'Điểm mạnh của em là tính nghiêm túc.'],
  ['tansho', '短所', 'たんしょ', 'tansho', 'điểm yếu', '短所は緊張しやすいところです。', 'Tansho wa kinchou shiyasui tokoro desu.', 'Điểm yếu là em dễ căng thẳng.'],
  ['shitsumon', '質問', 'しつもん', 'shitsumon', 'câu hỏi', '質問してもいいですか。', 'Shitsumon shite mo ii desu ka.', 'Em hỏi một chút được không ạ?'],
  ['ganbarimasu', '頑張ります', 'がんばります', 'ganbarimasu', 'em sẽ cố gắng', '一生懸命頑張ります。', 'Isshoukenmei ganbarimasu.', 'Em sẽ cố gắng hết mình.'],
  ['hatarakitai', '働きたい', 'はたらきたい', 'hatarakitai', 'muốn làm việc', '日本で長く働きたいです。', 'Nihon de nagaku hatarakitai desu.', 'Em muốn làm việc lâu dài ở Nhật.'],
  ['shourai', '将来', 'しょうらい', 'shourai', 'tương lai', '将来はリーダーになりたいです。', 'Shourai wa riidaa ni naritai desu.', 'Tương lai em muốn trở thành trưởng nhóm.'],
  ['mokuhyou', '目標', 'もくひょう', 'mokuhyou', 'mục tiêu', '目標はJFTに合格することです。', 'Mokuhyou wa JFT ni goukaku suru koto desu.', 'Mục tiêu của em là đỗ kỳ thi JFT.'],
];

const SEIKATSU: CardSeed[] = [
  ['byouin', '病院', 'びょういん', 'byouin', 'bệnh viện', '頭が痛いので、病院に行きます。', 'Atama ga itai node, byouin ni ikimasu.', 'Vì đau đầu nên em đi bệnh viện.'],
  ['kusuri', '薬', 'くすり', 'kusuri', 'thuốc', '食後に薬を飲みます。', 'Shokugo ni kusuri o nomimasu.', 'Uống thuốc sau bữa ăn.'],
  ['densha', '電車', 'でんしゃ', 'densha', 'tàu điện', '電車で職場に行きます。', 'Densha de shokuba ni ikimasu.', 'Đi làm bằng tàu điện.'],
  ['eki', '駅', 'えき', 'eki', 'nhà ga', '駅から歩いて5分です。', 'Eki kara aruite gofun desu.', 'Từ ga đi bộ 5 phút.'],
  ['kaimono', '買い物', 'かいもの', 'kaimono', 'mua sắm', '週末にスーパーで買い物します。', 'Shuumatsu ni suupaa de kaimono shimasu.', 'Cuối tuần đi mua sắm ở siêu thị.'],
  ['gomi', 'ゴミ', 'ゴミ', 'gomi', 'rác', 'ゴミは分別して出します。', 'Gomi wa bunbetsu shite dashimasu.', 'Rác phải phân loại rồi mới đem đổ.'],
  ['ryou', '寮', 'りょう', 'ryou', 'ký túc xá', '会社の寮に住んでいます。', 'Kaisha no ryou ni sunde imasu.', 'Em đang sống ở ký túc xá công ty.'],
  ['keitai-denwa', '携帯電話', 'けいたいでんわ', 'keitai denwa', 'điện thoại di động', '仕事中は携帯電話を使いません。', 'Shigotochuu wa keitai denwa o tsukaimasen.', 'Trong giờ làm không dùng điện thoại.'],
  ['ginkou', '銀行', 'ぎんこう', 'ginkou', 'ngân hàng', '銀行は3時に閉まります。', 'Ginkou wa sanji ni shimarimasu.', 'Ngân hàng đóng cửa lúc 3 giờ.'],
  ['yuubinkyoku', '郵便局', 'ゆうびんきょく', 'yuubinkyoku', 'bưu điện', '郵便局で荷物を送ります。', 'Yuubinkyoku de nimotsu o okurimasu.', 'Gửi đồ ở bưu điện.'],
  ['tenki', '天気', 'てんき', 'tenki', 'thời tiết', '明日の天気はどうですか。', 'Ashita no tenki wa dou desu ka.', 'Thời tiết ngày mai thế nào?'],
  ['ryouri', '料理', 'りょうり', 'ryouri', 'nấu ăn, món ăn', 'ベトナム料理を作ります。', 'Betonamu ryouri o tsukurimasu.', 'Em nấu món ăn Việt Nam.'],
];

const JIKAN: CardSeed[] = [
  ['jikan', '時間', 'じかん', 'jikan', 'thời gian, giờ', '時間を守ることが大切です。', 'Jikan o mamoru koto ga taisetsu desu.', 'Giữ đúng giờ là điều quan trọng.'],
  ['kyou', '今日', 'きょう', 'kyou', 'hôm nay', '今日は忙しいです。', 'Kyou wa isogashii desu.', 'Hôm nay bận.'],
  ['ashita', '明日', 'あした', 'ashita', 'ngày mai', '明日は休みです。', 'Ashita wa yasumi desu.', 'Ngày mai được nghỉ.'],
  ['kinou', '昨日', 'きのう', 'kinou', 'hôm qua', '昨日、残業しました。', 'Kinou, zangyou shimashita.', 'Hôm qua em làm thêm giờ.'],
  ['gozen', '午前', 'ごぜん', 'gozen', 'buổi sáng (AM)', '午前9時に始まります。', 'Gozen kuji ni hajimarimasu.', 'Bắt đầu lúc 9 giờ sáng.'],
  ['gogo', '午後', 'ごご', 'gogo', 'buổi chiều (PM)', '午後から会議があります。', 'Gogo kara kaigi ga arimasu.', 'Từ chiều có cuộc họp.'],
  ['mainichi', '毎日', 'まいにち', 'mainichi', 'mỗi ngày', '毎日、日本語を勉強します。', 'Mainichi, nihongo o benkyou shimasu.', 'Mỗi ngày đều học tiếng Nhật.'],
  ['shuumatsu', '週末', 'しゅうまつ', 'shuumatsu', 'cuối tuần', '週末は友達と出かけます。', 'Shuumatsu wa tomodachi to dekakemasu.', 'Cuối tuần đi chơi với bạn.'],
  ['yotei', '予定', 'よてい', 'yotei', 'lịch, dự định', '明日の予定を確認します。', 'Ashita no yotei o kakunin shimasu.', 'Xác nhận lịch ngày mai.'],
  ['shimekiri', '締め切り', 'しめきり', 'shimekiri', 'hạn chót', '締め切りは今週の金曜日です。', 'Shimekiri wa konshuu no kinyoubi desu.', 'Hạn chót là thứ Sáu tuần này.'],
  ['kikai', '機械', 'きかい', 'kikai', 'máy móc', '機械の使い方を覚えます。', 'Kikai no tsukaikata o oboemasu.', 'Học cách sử dụng máy móc.'],
  ['dougu', '道具', 'どうぐ', 'dougu', 'dụng cụ', '道具を元の場所に戻します。', 'Dougu o moto no basho ni modoshimasu.', 'Trả dụng cụ về đúng chỗ cũ.'],
  ['hinshitsu', '品質', 'ひんしつ', 'hinshitsu', 'chất lượng', '品質をチェックします。', 'Hinshitsu o chekku shimasu.', 'Kiểm tra chất lượng sản phẩm.'],
  ['kensa', '検査', 'けんさ', 'kensa', 'kiểm tra, kiểm định', '最後に検査をします。', 'Saigo ni kensa o shimasu.', 'Cuối cùng là khâu kiểm tra.'],
];

export const TOKUTEI_VOCAB: TokuteiVocabCard[] = [
  ...buildCards('aisatsu', AISATSU),
  ...buildCards('shokuba', SHOKUBA),
  ...buildCards('hourensou', HOURENSOU),
  ...buildCards('anzen', ANZEN),
  ...buildCards('shorui', SHORUI),
  ...buildCards('mensetsu', MENSETSU),
  ...buildCards('seikatsu', SEIKATSU),
  ...buildCards('jikan', JIKAN),
];

const cardById = new Map(TOKUTEI_VOCAB.map((card) => [card.id, card]));
const topicById = new Map(TOKUTEI_TOPICS.map((topic) => [topic.id, topic]));

export function getVocabCard(id: string): TokuteiVocabCard | undefined {
  return cardById.get(id);
}

export function getTopic(id: TokuteiTopicId): TokuteiTopic {
  return topicById.get(id) ?? TOKUTEI_TOPICS[0];
}

export function cardsOfTopic(topicId: TokuteiTopicId): TokuteiVocabCard[] {
  return TOKUTEI_VOCAB.filter((card) => card.topicId === topicId);
}

/** Từ liên quan: cùng chủ đề, khác id (tối đa `limit` từ). */
export function relatedCards(id: string, limit = 4): TokuteiVocabCard[] {
  const card = cardById.get(id);
  if (!card) return [];
  return TOKUTEI_VOCAB.filter((item) => item.topicId === card.topicId && item.id !== id).slice(0, limit);
}

function normalize(value: string): string {
  return value.toLowerCase().normalize('NFC').trim();
}

/** Tìm kiếm trên word/reading/romaji/meaning (không phân biệt hoa thường). */
export function searchVocab(query: string): TokuteiVocabCard[] {
  const q = normalize(query);
  if (!q) return [];
  return TOKUTEI_VOCAB.filter((card) =>
    [card.word, card.reading, card.romaji, card.meaning, card.exampleJp, card.exampleVi]
      .some((field) => normalize(field).includes(q)),
  );
}
