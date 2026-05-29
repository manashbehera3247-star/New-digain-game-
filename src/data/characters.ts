export interface FolkloreCharacter {
  id: string;
  nameOdia: string;
  nameEng: string;
  roleOdia: string;
  roleEng: string;
  backstoryOdia: string;
  backstoryEng: string;
  dialogues: {
    rollSix: { odia: string; eng: string };
    capturing: { odia: string; eng: string };
    getCaptured: { odia: string; eng: string };
    reachHome: { odia: string; eng: string };
    winGame: { odia: string; eng: string };
    generic: { odia: string; eng: string }[];
  };
  avatarEmoji: string;
  themeColor: string; // Tailind class name
}

export const ODIA_FOLKLORE_CHARACTERS: FolkloreCharacter[] = [
  {
    id: 'dharmapada',
    nameOdia: 'ଧର୍ମପଦ',
    nameEng: 'Dharmapada',
    roleOdia: 'ବୀର ବାଳକ ସ୍ଥପତି',
    roleEng: 'Boy Wonder Architect',
    backstoryOdia: 'ସେହି ୧୨ ବର୍ଷର ମହାନ ବାଳକ, ଯିଏ କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିରର ଦଧିନଉତି ମାରି ୧୨୦୦ କାରିଗରଙ୍କ ସମ୍ମାନ ଏବଂ ପ୍ରାଣ ବଞ୍ଚାଇବା ପାଇଁ ଚନ୍ଦ୍ରଭାଗା ନଦୀକୁ ଡେଇଁ ନିଜର ଆତ୍ମବଳିଦାନ ଦେଇଥିଲେ।',
    backstoryEng: 'The legendary 12-year-old boy of Odisha who solved the architectural puzzle of the Konark Sun Temple, crowning its dome and sacrificing his life into the Chandrabhaga river to save the lives of 1,200 craftsmen.',
    dialogues: {
      rollSix: {
        odia: 'ବାଃ, କଳା ଠାକୁରଙ୍କ କୃପାରୁ ଛକାଟିଏ ପଡିଲା! ଆମ କୋଣାର୍କ କାର୍ଯ୍ୟ ସମାପ୍ତ ହେବ!',
        eng: 'Marvelous! By the grace of Lord Jagannath, it is a six! Our Konark crown rises!'
      },
      capturing: {
        odia: 'ମୁଁ ଦେଖାଇଦେବି ଯେ ଓଡ଼ିଆ ବାଳକ ଦଧିନଉତି ମାରିପାରେ ଏବଂ ଗୋଟି କାଟି ମଧ୍ୟ ପାରେ!',
        eng: 'I will prove that a young Odia boy can both crown Konark and strike your token!'
      },
      getCaptured: {
        odia: 'ଅପେକ୍ଷା କର, ପୁଣି ଥରେ ଚେଷ୍ଟା କରି ମୁଁ ଧର୍ମ ରଖିବି!',
        eng: 'Wait, I will try again and hold the honor of my lineage!'
      },
      reachHome: {
        odia: 'କାମ ଶେଷ ହେଲା! ଆମେ ମହାମନ୍ଦିରର ଦଧିନଉତି ମାରି ଗୃହ ପ୍ରବେଶ କଲୁ!',
        eng: 'Work is complete! We have crowned the grand temple and successfully reached home!'
      },
      winGame: {
        odia: '୧୨୦୦ କାରିଗରଙ୍କ ମାନ ରହିଗଲା! ଓଡ଼ିଆ କଳାର ବିଜୟ ହେଲା!',
        eng: 'The honor of 1,200 craftsmen is secured! Odisha\'s unmatched skill wins!'
      },
      generic: [
        { odia: 'କେବେ ହାର ମାନିବିନି, ଓଡ଼ିଆ ପୁଅ ଭଲ କାମ ଜାଣିଛି!', eng: 'I will never give up, a son of Odisha knows his master craft!' },
        { odia: 'ନିୟମ ଅନୁସାରେ ଚାଲନ୍ତୁ, ବିଚାରଶକ୍ତି ହିଁ ବିଜୟର ଚାବିକାଠି।', eng: 'Move according to rules; intellect is the true key to victory.' }
      ]
    },
    avatarEmoji: '👦',
    themeColor: 'emerald'
  },
  {
    id: 'kharavela',
    nameOdia: 'ସମ୍ରାଟ ଖାରବେଳ',
    nameEng: 'Emperor Kharavela',
    roleOdia: 'କଳିଙ୍ଗର ମହାପ୍ରତାପୀ ସମ୍ରାଟ',
    roleEng: 'Imperial Lord of Kalinga',
    backstoryOdia: 'ମହା ମେଘବାହନ ମହାରାଜ ଖାରବେଳ, ଯିଏ ପ୍ରାଚୀନ କଳିଙ୍ଗକୁ ଏକ ବିଶାଳ ସାମ୍ରାଜ୍ୟରେ ପରିଣତ କରିଥିଲେ। ଖଣ୍ଡଗିରି ଏବଂ ଉଦୟଗିରି ଗୁମ୍ଫାର ଶିଳାଲେଖରେ ତାଙ୍କର ଦିଗ୍ବିଜୟ କାହାଣୀ ପ୍ରତିଫଳିତ।',
    backstoryEng: 'The mighty ancient King of Kalinga Empire of the Mahameghavahana dynasty. He was a devout patron of arts and a martial genius who expanded Kalinga beyond its borders, recorded in the Hathigumpha inscriptions of Udayagiri.',
    dialogues: {
      rollSix: {
        odia: 'ସାର୍ବଭୌମ ଶକ୍ତିର ପ୍ରଦର୍ଶନ! ଛକା ପଡିଛି, ଆମ ସୈନ୍ୟବାହିନୀ ଖେଦିଯିବେ!',
        eng: 'A display of sovereign power! It\'s a six, my army marches onwards!'
      },
      capturing: {
        odia: 'କଳିଙ୍ଗ ସେନା ଆଗରେ ମୁଣ୍ଡ ନୁଆଁଅ! କାଟି ଦିଅ!',
        eng: 'Bow down before Kalinga\'s imperial legion! Clear the path!'
      },
      getCaptured: {
        odia: 'ଏହା ଏକ ସାମୟିକ ପରାଜୟ ମାତ୍ର, ମୋର ଦ୍ୱିତୀୟ ଆକ୍ରମଣ ଅତ୍ୟନ୍ତ ଭୟଙ୍କର ହେବ!',
        eng: 'A temporary setback! My counters and reinforcements shall be fierce!'
      },
      reachHome: {
        odia: 'ଆମେ ଆମର ଗୌରବଶାଳୀ ଦୁର୍ଗକୁ ସଫଳତାର ସହ ପ୍ରତ୍ୟାବର୍ତ୍ତନ କରିଛୁ!',
        eng: 'We have triumphantly returned to our grand, unconquered fortress!'
      },
      winGame: {
        odia: 'ବିଶ୍ୱବିଜୟ ହେଲା! କଳିଙ୍ଗରେ ଆଜି ବିଜୟର ମହୋତ୍ସବ ପାଳନ ହେବ!',
        eng: 'Universal victory is achieved! Let Kalinga ring with festival celebrations today!'
      },
      generic: [
        { odia: 'ଚତୁରଙ୍ଗ ବଳ ପ୍ରସ୍ତୁତ ରଖ, ଏହି ରଣଭୂମିରେ ମୁଁ ବିଜୟୀ ହେବି।', eng: 'Prepare the infantry and cavalry, I shall conquer this battlefield.' },
        { odia: 'ଶ୍ରେଷ୍ଠ ଯୋଦ୍ଧା ସାହସ ଏବଂ ସୈନ୍ୟ ଚାଲାଣରୁ ଚିହ୍ନାପଡେ।', eng: 'A supreme warrior is known through martial courage and tactical genius.' }
      ]
    },
    avatarEmoji: '👑',
    themeColor: 'amber'
  },
  {
    id: 'baji_rout',
    nameOdia: 'ବାଜି ରାଉତ',
    nameEng: 'Baji Rout',
    roleOdia: 'ଶ୍ରେଷ୍ଠ ଶିଶୁ ସଂଗ୍ରାମୀ',
    roleEng: 'Youngest Boatman Martyr',
    backstoryOdia: 'ଦେଶପ୍ରେମର ଅନନ୍ୟ ପ୍ରତୀକ, ଯିଏ ନିଜର ଦେଶାବୋଧ ଯୋଗୁଁ ରାତିରେ ବ୍ରିଟିଶ ସେନାଙ୍କୁ ବ୍ରାହ୍ମଣୀ ନଦୀ ପାର କରିବାକୁ ମନା କରି ନିଜର ପ୍ରାଣବଳି ଦେଇଥିଲେ। ସେ ଭାରତର ସର୍ବକନିଷ୍ଠ ଶହୀଦ (୧୨ ବର୍ଷ)।',
    backstoryEng: 'The youngest freedom fighter and martyr of India (only 12 years old). A brave boatman boy from Dhenkanal who stood firm against British soldiers, refusing to ferry them across the Brahmani river, choosing death over surrender.',
    dialogues: {
      rollSix: {
        odia: 'ନଈ ପାରି ହେବାକୁ ପାଲା ପଡ଼ିଲା, ଛକାଟିଏ ମିଳିଗଲା, ଚାଲନ୍ତୁ ନୌକା ବାହିବା!',
        eng: 'The call to cross the river sounds! Got a six, let\'s row the oars forward!'
      },
      capturing: {
        odia: 'ଭୟଭୀତ ହୁଅନ୍ତିନି ଭାରତର ସନ୍ତାନ! ଆମେ ଆପଣଙ୍କୁ ଆମ ଘାଟରେ ରୋକି ଦେଲୁ!',
        eng: 'A child of India fears no one! We corner you at our river dock!'
      },
      getCaptured: {
        odia: 'ଇଂରେଜ ଅମଲା ମଧ୍ୟ ମୋ ଗୋଟିକୁ ଅଟକାଇ ପାରିନଥିଲେ, ତୁମେ ତ କେଉଁ ଛାର!',
        eng: 'Even colonial guns couldn\'t stop my spirit; this capture is a minor test!'
      },
      reachHome: {
        odia: 'ଝଡ଼ ତୋଫାନକୁ କାଟି ଆମ ନୌକା କୂଳରେ ପହଞ୍ଚିଗଲା!',
        eng: 'Bypassing rain and storm, our boat has safe-docked at the home port!'
      },
      winGame: {
        odia: 'ଆମ ମାଟି ସାରା ଓଡ଼ିଶାର ବିଜୟ ହୋଇଛି, ସୁରାଜ୍ୟର ପତାକା ଉଡିଲା!',
        eng: 'Freedom and justice win today across Odisha\'s sacred soil!'
      },
      generic: [
        { odia: 'ମୁଁ ଦୁର୍ନୀତି ଆଗରେ ନଇଁବି ନାହିଁ, ଚାଲନ୍ତୁ ସଚ୍ଚୋଟତାର ସହ ଖେଳିବା!', eng: 'I will never bend before injustice; let\'s play with honesty!' },
        { odia: 'ବ୍ରାହ୍ମଣୀ ନଦୀର ସ୍ୱଚ୍ଛ ପାଣି ପରି ଆମ ନୀତି ସ୍ପଷ୍ଟ।', eng: 'Clear as the waters of Brahmani river, our policy is perfectly true.' }
      ]
    },
    avatarEmoji: '🛶',
    themeColor: 'cyan'
  },
  {
    id: 'jayee_rajguru',
    nameOdia: 'ଜୟୀ ରାଜଗୁରୁ',
    nameEng: 'Jayee Rajguru',
    roleOdia: 'ପ୍ରଥମ ସହିଦ ପାଇକ ସେନାପତି',
    roleEng: 'First Martyr of Paika Force',
    backstoryOdia: 'ଖୋର୍ଦ୍ଧା ରାଜଦରବାରର ମୁଖ୍ୟ ପରାମର୍ଶଦାତା ଏବଂ ପ୍ରଚଣ୍ଡ ବିଜ୍ଞାନଶାଳୀ ପଣ୍ଡିତ, ଯିଏ ବ୍ରିଟିଶ ଶାସନ ବିରୋଧରେ ପ୍ରଥମ ପୂର୍ଣ୍ଣ ସଶସ୍ତ୍ର କଳିଙ୍ଗ ବିଦ୍ରୋହର ସଫଳ ନେତୃତ୍ୱ ନେଇ ନୃଶଂସ ଭାବେ ଶହୀଦ ହୋଇଥିଲେ।',
    backstoryEng: 'The premier royal priest and royal commander-in-chief of Khurda. A stellar scholar and fighter, he pioneered the initial armed resistance of Paikas against the East India Company, paying the ultimate sacrifice.',
    dialogues: {
      rollSix: {
        odia: 'ମହାଦେବଙ୍କ ଆଶୀର୍ବାଦ ମିଳିଗଲା, ମୋ ଗୋଟି ଋଣକୌଶଳରେ ଛକା ମାରିଲା!',
        eng: 'The blessings of Lord Shiva are received; tactical warfare scores a six!'
      },
      capturing: {
        odia: 'ଧର୍ମଯୁଦ୍ଧରେ ଅନ୍ୟାୟକାରୀଙ୍କୁ ପରାଜିତ କରିଦେଲି! ଗୋଟି କାଟିଦେଲି!',
        eng: 'An oppressor is vanquished in this righteous war! Captured!'
      },
      getCaptured: {
        odia: 'ରକ୍ତଦାନ କରିବା ଆମ ପାଇକଙ୍କ ଧର୍ମ, ମୁଁ ପୁଣି ସମାରୋହରେ ଫେରିବି!',
        eng: 'Shedding blood is the shield of Paika; I will rise again with pride!'
      },
      reachHome: {
        odia: 'ଆମର ରକ୍ଷାକବଚ ବିଜୟୀ ହୋଇ ଗୃହ ପ୍ରବେଶ କଲା, ଶତ୍ରୁ ପରାଜିତ!',
        eng: 'Our shield of defense has secured the home sanctum. The line holds!'
      },
      winGame: {
        odia: 'ସତ୍ଯର ଜୟ ହେଲା! ଓଡ଼ିଶାର ବିପ୍ଳବ ଆଜି ବିଶ୍ୱବିଜୟୀ ହୋଇଛି!',
        eng: 'Truth prevails! The historic struggle of Odisha emerges victorious!'
      },
      generic: [
        { odia: 'ଓଡ଼ିଆ ପାଇକ କଦାପି ପ୍ରାଣ ଭୟରେ ରଣଭୂମି ଛାଡେ ନାହିଁ।', eng: 'An Odia warrior never flees the battleground in fear of death.' },
        { odia: 'ଶାନ୍ତି ଏବଂ ତାତ୍ତ୍ଵିକ ବଳ ଦ୍ଵାରା ଆମେ ବଡ଼ ରଣ ଜିତିପାରିବା।', eng: 'With peace and spiritual strength, we can win the greatest of wars.' }
      ]
    },
    avatarEmoji: '⚔️',
    themeColor: 'rose'
  },
  {
    id: 'bakshi_jagabandhu',
    nameOdia: 'ବକ୍ସି ଜଗବନ୍ଧୁ',
    nameEng: 'Bakshi Jagabandhu',
    roleOdia: 'ପାଇକ ବିଦ୍ରୋହର ମହାନ୍ ମହାନାୟକ',
    roleEng: 'Supreme Leader of Paika Rebellion',
    backstoryOdia: 'ବକ୍ସି ଜଗବନ୍ଧୁ ବିଦ୍ୟାଧର ମହାପାତ୍ର ଭ୍ରମରବର ରାୟ, ଯିଏ ଖୋର୍ଦ୍ଧାର ପାଇକ ପୁଅଙ୍କୁ ଏକାଠି କରି ୧୮୧୭ ମସିହାରେ ବଜ୍ରଗମ୍ଭୀର ସ୍ୱରରେ ବ୍ରିଟିଶ କମ୍ପାନୀ ସେନା ବିରୁଦ୍ଧରେ ମହାନ୍ "ପାଇକ ବିଦ୍ରୋହ" ସଂଗଠିତ କରିଥିଲେ।',
    backstoryEng: 'The supreme commander/General of the King of Khurda forces. In 1817, he unified the local Paika warrior clans of Odisha, forging the first massive organized national independence struggle against British colonial rule.',
    dialogues: {
      rollSix: {
        odia: 'ଘୋରି ଯାଅ ପାଇକ ପୁତ୍ର! ବକ୍ସି ବଜ୍ର ବାଣ ଚଳାଇ ଛକାଆ ପାଇଲା!',
        eng: 'Onward, sons of Paika! Bakshi gains a thunderbolt strike of six!'
      },
      capturing: {
        odia: 'ପାଇକ ବାହିନୀର ପ୍ରହାର ଦେଖ, ଶତ୍ରୁ ସେନା ଧୂଳିସାତ!',
        eng: 'Witness the sweeping swing of the Paikas! The opponent is demolished!'
      },
      getCaptured: {
        odia: 'ପ୍ରତିକୂଳ ପରିସ୍ଥିତିରେ ବି ପାଇକ ପୁଅ ଲଢେ, ଖୁବ୍ ଶୀଘ୍ର ପ୍ରତିଶୋଧ ନେବି!',
        eng: 'A Paika fights in adversity too, I will strike back at once!'
      },
      reachHome: {
        odia: 'ଆମର ବୀରତ୍ୱ ଦୁର୍ଗ ରକ୍ଷା କଲା! ଗୁଟି ସୁରକ୍ଷିତ ଘରକୁ ଆସିଲା!',
        eng: 'Our valor protected the fort! The coin returns safely inside home borders!'
      },
      winGame: {
        odia: 'ଖୋର୍ଦ୍ଧା ମାଟି କେବେ ପରାଧୀନ ହୋଇନାହିଁ, ଆମେ ବିଜୟୀ!',
        eng: 'The soil of Khurda was never conquered, and we are supreme!'
      },
      generic: [
        { odia: 'ସମସ୍ତ ସାଥୀଙ୍କୁ ଏକଜୁଟ୍ କରନ୍ତୁ, ଓଡ଼ିଶାର ଏକତାରେ ଶକ୍ତି ଅଛି!', eng: 'Assemble all comrades together, Odisha\'s unity is our absolute force!' },
        { odia: 'ରଣଭୂମିରେ ଚୋରା ଆକ୍ରମଣ ନୁହେଁ, ସମ୍ମୁଖ ସମର କରି ଶିଖନ୍ତୁ।', eng: 'Never rely on stealthy back-stabbing; learn to engage in direct combat.' }
      ]
    },
    avatarEmoji: '🏹',
    themeColor: 'teal'
  }
];
