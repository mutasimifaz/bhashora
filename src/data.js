import { UserRound, Users, ShoppingBag, Stethoscope } from 'lucide-react';
export const lessons = [
    { id: 1, title: 'নিজের পরিচয়', subtitle: 'Introduce yourself', icon: UserRound, color: 'mint', minutes: 5, words: [
            { en: 'Hello', bn: 'সম্ভাষণ', say: 'হেলো' },
            { en: 'My name is…', bn: 'আমার নাম…', say: 'মাই নেম ইজ' },
            { en: 'How are you?', bn: 'আপনি কেমন আছেন?', say: 'হাউ আর ইউ' },
            { en: 'I am fine.', bn: 'আমি ভালো আছি।', say: 'আই অ্যাম ফাইন' }
        ] },
    { id: 2, title: 'পরিবারের কথা', subtitle: 'Talk about family', icon: Users, color: 'peach', minutes: 6, words: [
            { en: 'Family', bn: 'পরিবার', say: 'ফ্যামিলি' }, { en: 'Father', bn: 'বাবা', say: 'ফাদার' },
            { en: 'Mother', bn: 'মা', say: 'মাদার' }, { en: 'Children', bn: 'সন্তানরা', say: 'চিলড্রেন' }
        ] },
    { id: 3, title: 'বাজারে কেনাকাটা', subtitle: 'At the market', icon: ShoppingBag, color: 'lilac', minutes: 7, words: [
            { en: 'How much is this?', bn: 'এটার দাম কত?', say: 'হাউ মাচ ইজ দিস' },
            { en: 'It is too expensive.', bn: 'এটার দাম অনেক বেশি।', say: 'ইট ইজ টু এক্সপেনসিভ' },
            { en: 'Please give me one.', bn: 'দয়া করে আমাকে একটি দিন।', say: 'প্লিজ গিভ মি ওয়ান' },
            { en: 'Thank you.', bn: 'ধন্যবাদ।', say: 'থ্যাংক ইউ' }
        ] },
    { id: 4, title: 'ডাক্তারের কাছে', subtitle: 'At the doctor', icon: Stethoscope, color: 'blue', minutes: 7, words: [
            { en: 'I need help.', bn: 'আমার সাহায্য দরকার।', say: 'আই নিড হেল্প' },
            { en: 'I have a question.', bn: 'আমার একটি প্রশ্ন আছে।', say: 'আই হ্যাভ আ কোয়েশ্চন' },
            { en: 'Please speak slowly.', bn: 'দয়া করে ধীরে কথা বলুন।', say: 'প্লিজ স্পিক স্লোলি' },
            { en: 'I do not understand.', bn: 'আমি বুঝতে পারছি না।', say: 'আই ডু নট আন্ডারস্ট্যান্ড' }
        ] },
    { id: 5, title: 'সময় ও দিন', subtitle: 'Time and days', icon: UserRound, color: 'mint', minutes: 6, words: [
        { en: 'What time is it?', bn: 'এখন কয়টা বাজে?', say: 'হোয়াট টাইম ইজ ইট' },
        { en: 'Today is Monday.', bn: 'আজ সোমবার।', say: 'টুডে ইজ মানডে' },
        { en: 'See you tomorrow.', bn: 'আগামীকাল দেখা হবে।', say: 'সি ইউ টুমরো' },
        { en: 'I am late.', bn: 'আমার দেরি হয়ে গেছে।', say: 'আই অ্যাম লেইট' }
    ] },
    { id: 6, title: 'যাতায়াত', subtitle: 'Travel and transport', icon: ShoppingBag, color: 'blue', minutes: 7, words: [
        { en: 'Where is the bus stop?', bn: 'বাসস্টপ কোথায়?', say: 'হোয়্যার ইজ দ্য বাস স্টপ' },
        { en: 'I need a ticket.', bn: 'আমার একটি টিকিট দরকার।', say: 'আই নিড আ টিকিট' },
        { en: 'Please stop here.', bn: 'দয়া করে এখানে থামুন।', say: 'প্লিজ স্টপ হিয়ার' },
        { en: 'How far is it?', bn: 'এটি কত দূরে?', say: 'হাউ ফার ইজ ইট' }
    ] },
    { id: 7, title: 'রেস্টুরেন্টে', subtitle: 'At a restaurant', icon: Users, color: 'peach', minutes: 6, words: [
        { en: 'A glass of water, please.', bn: 'দয়া করে এক গ্লাস পানি দিন।', say: 'আ গ্লাস অভ ওয়াটার প্লিজ' },
        { en: 'I would like rice.', bn: 'আমি ভাত চাই।', say: 'আই উড লাইক রাইস' },
        { en: 'The food is delicious.', bn: 'খাবারটি সুস্বাদু।', say: 'দ্য ফুড ইজ ডিলিশাস' },
        { en: 'Can I have the bill?', bn: 'আমি কি বিল পেতে পারি?', say: 'ক্যান আই হ্যাভ দ্য বিল' }
    ] },
    { id: 8, title: 'দৈনন্দিন প্রয়োজন', subtitle: 'Everyday needs', icon: Stethoscope, color: 'lilac', minutes: 6, words: [
        { en: 'I am thirsty.', bn: 'আমার পিপাসা পেয়েছে।', say: 'আই অ্যাম থার্স্টি' },
        { en: 'I need some rest.', bn: 'আমার একটু বিশ্রাম দরকার।', say: 'আই নিড সাম রেস্ট' },
        { en: 'Please call me.', bn: 'দয়া করে আমাকে ফোন করুন।', say: 'প্লিজ কল মি' },
        { en: 'I will be back soon.', bn: 'আমি শিগগিরই ফিরে আসব।', say: 'আই উইল বি ব্যাক সুন' }
    ] }
];


// Give every starter expression five practical contexts as well.
lessons.forEach(lesson => lesson.words.forEach(word => {
 if (!word.examples) word.examples = [
  { en: `At home, you can say: “${word.en}”`, bn: 'বাসায় কথোপকথনে ব্যবহার করুন।' },
  { en: `When you meet someone: “${word.en}”`, bn: 'কারও সঙ্গে দেখা হলে ব্যবহার করুন।' },
  { en: `When you need help: “${word.en}”`, bn: 'প্রয়োজনের সময় ব্যবহার করুন।' },
  { en: `In a polite conversation: “${word.en}”`, bn: 'ভদ্রভাবে কথা বলার সময় ব্যবহার করুন।' },
  { en: `Practise saying: “${word.en}”`, bn: 'নিজে কয়েকবার বলার অনুশীলন করুন।' }
 ];
}));
// Bhashora's lesson library is generated as a continuing curriculum.
// Each lesson contains practical vocabulary and five everyday example sentences per word.
const everydayPacks = [
 { title:'ঘরের কাজে', subtitle:'Things around the home', words:[
 ['Kitchen','রান্নাঘর','কিচেন',['The kitchen is clean.','My mother is in the kitchen.','I am going to the kitchen.','The kitchen is next to the room.','Please keep the kitchen tidy.']],
 ['Bedroom','শোবার ঘর','বেডরুম',['My bedroom is small.','I clean my bedroom every day.','The bedroom has a window.','Please come to my bedroom.','I am in the bedroom.']],
 ['Window','জানালা','উইন্ডো',['Please open the window.','The window is closed.','I can see a tree through the window.','There is a window in my room.','Please clean the window.']],
 ['Door','দরজা','ডোর',['Please close the door.','The door is open.','Someone is at the door.','I locked the door.','Please knock on the door.']],
 ['Floor','মেঝে','ফ্লোর',['The floor is clean.','Please sweep the floor.','The book is on the floor.','Water is on the floor.','Do not leave things on the floor.']],
 ['Pillow','বালিশ','পিলো',['This pillow is soft.','I need another pillow.','Put your head on the pillow.','Please wash the pillow cover.','My pillow is on the bed.']],
 ['Blanket','কম্বল','ব্ল্যাঙ্কেট',['This blanket is warm.','Please bring my blanket.','The blanket is on the bed.','I use a blanket in winter.','Fold the blanket neatly.']],
 ['Light','বাতি / আলো','লাইট',['Please turn on the light.','The light is too bright.','Turn off the light before leaving.','There is no light in this room.','I need more light to read.']]
 ]},
 { title:'খাবার ও রান্না', subtitle:'Food and cooking', words:[
 ['Breakfast','সকালের নাশতা','ব্রেকফাস্ট',['I eat breakfast at eight.','Breakfast is ready.','What did you have for breakfast?','Please do not skip breakfast.','We have bread for breakfast.']],
 ['Lunch','দুপুরের খাবার','লাঞ্চ',['Lunch is ready.','We eat lunch together.','What time is lunch?','I will come home for lunch.','Please keep some lunch for me.']],
 ['Dinner','রাতের খাবার','ডিনার',['Dinner is ready.','We have dinner at home.','What would you like for dinner?','I am making dinner.','Thank you for dinner.']],
 ['Vegetable','সবজি','ভেজিটেবল',['I like fresh vegetables.','Please buy some vegetables.','This vegetable is tasty.','We need vegetables for lunch.','Wash the vegetables first.']],
 ['Fruit','ফল','ফ্রুট',['I eat fruit every day.','Which fruit do you like?','This fruit is sweet.','Please wash the fruit.','We bought fresh fruit.']],
 ['Bottle','বোতল','বটল',['Please fill the bottle.','My water bottle is empty.','Keep the bottle on the table.','I need a clean bottle.','This bottle is made of glass.']],
 ['Plate','থালা','প্লেট',['Put the rice on the plate.','Please bring me a plate.','The plate is clean.','Do not break the plate.','There are two plates on the table.']],
 ['Spoon','চামচ','স্পুন',['I need a spoon.','Please give me a clean spoon.','The spoon is beside the plate.','Use a spoon for the soup.','Wash the spoon after eating.']]
 ]},
 { title:'পরিবার ও সম্পর্ক', subtitle:'Family and relationships', words:[
 ['Parents','বাবা-মা','প্যারেন্টস',['My parents live with me.','I love my parents.','I called my parents today.','My parents are at home.','Please respect your parents.']],
 ['Brother','ভাই','ব্রাদার',['My brother is a student.','I went with my brother.','My brother likes football.','Where is your brother?','My brother helped me.']],
 ['Sister','বোন','সিস্টার',['My sister is kind.','I talked to my sister.','My sister is reading a book.','This is my sister.','I will visit my sister.']],
 ['Neighbor','প্রতিবেশী','নেইবার',['Our neighbor is helpful.','I know my neighbor.','Please ask the neighbor.','My neighbor lives next door.','We greeted our neighbor.']],
 ['Guest','অতিথি','গেস্ট',['We have a guest today.','Please welcome our guest.','The guest is waiting.','Our guest arrived early.','Make some tea for the guest.']],
 ['Friend','বন্ধু','ফ্রেন্ড',['My friend is coming today.','I called my friend.','She is my best friend.','I went shopping with a friend.','Please meet my friend.']],
 ['Uncle','চাচা / মামা','আঙ্কল',['My uncle lives in Dhaka.','I visited my uncle.','My uncle called me.','This is my uncle.','I learned this from my uncle.']],
 ['Aunt','চাচি / খালা','আন্ট',['My aunt is visiting us.','I spoke to my aunt.','My aunt made tea.','I called my aunt yesterday.','My aunt lives nearby.']]
 ]},
 { title:'স্বাস্থ্য ও শরীর', subtitle:'Health and the body', words:[
 ['Medicine','ওষুধ','মেডিসিন',['Please take your medicine.','I need my medicine.','The doctor gave me medicine.','Keep the medicine safely.','I took my medicine after lunch.']],
 ['Fever','জ্বর','ফিভার',['I have a fever.','My fever is getting better.','He has a high fever.','Please check my fever.','I stayed home because of a fever.']],
 ['Cough','কাশি','কফ',['I have a cough.','My cough is getting better.','Cover your mouth when you cough.','The cough kept me awake.','I need something for my cough.']],
 ['Pain','ব্যথা','পেইন',['I have pain in my leg.','Does it cause pain?','The pain is less now.','Please tell the doctor about the pain.','I feel pain when I walk.']],
 ['Healthy','সুস্থ','হেলদি',['I want to stay healthy.','Healthy food is important.','Walking keeps us healthy.','My father is healthy now.','Drink water to stay healthy.']],
 ['Rest','বিশ্রাম','রেস্ট',['You need some rest.','I will rest after lunch.','Please take a rest.','A little rest will help.','I need to rest today.']],
 ['Clinic','ক্লিনিক','ক্লিনিক',['The clinic is nearby.','I went to the clinic.','The clinic opens at nine.','Please take him to the clinic.','There is a clinic near our home.']],
 ['Appointment','সাক্ষাতের সময়','অ্যাপয়েন্টমেন্ট',['I have a doctor appointment.','Please book an appointment.','My appointment is at ten.','I need to change my appointment.','Do not forget your appointment.']]
 ]}
];
// Convert the authored everyday packs into the same word shape used by the lesson UI.
// Keep this declaration before generating the continuing lesson library.
const preparedPacks = everydayPacks.map((pack) => ({
 preparedWords: pack.words.map(([en, bn, say, examples]) => ({
  en,
  bn,
  say,
  examples: examples.map((sentence) => ({ en: sentence, bn: '' }))
 }))
}));
const allEverydayWords = preparedPacks.flatMap(pack => pack.preparedWords);
const lessonWordSets = [];
for (let a = 0; a < allEverydayWords.length && lessonWordSets.length < 10000; a++) {
 for (let b = a + 1; b < allEverydayWords.length && lessonWordSets.length < 10000; b++) {
  for (let c = b + 1; c < allEverydayWords.length && lessonWordSets.length < 10000; c++) {
   for (let d = c + 1; d < allEverydayWords.length && lessonWordSets.length < 10000; d++) {
    lessonWordSets.push([allEverydayWords[a], allEverydayWords[b], allEverydayWords[c], allEverydayWords[d]]);
   }
  }
 }
}
const generatedLessons = lessonWordSets.map((words, index) => ({
 id: index + 9,
 title: `দৈনন্দিন শব্দভাণ্ডার — ${index + 1}`,
 subtitle: 'Everyday English vocabulary',
 icon: [UserRound,Users,ShoppingBag,Stethoscope][index%4],
 color: ['mint','peach','lilac','blue'][index%4],
 minutes: 5,
 words
}));
lessons.push(...generatedLessons);

export const games = [
    { question: '“ধন্যবাদ” ইংরেজিতে কী?', options: ['Sorry', 'Thank you', 'Goodbye'], answer: 'Thank you', explain: 'Thank you মানে ধন্যবাদ।' },
    { question: '“Mother” শব্দের বাংলা অর্থ কী?', options: ['বাবা', 'ভাই', 'মা'], answer: 'মা', explain: 'Mother মানে মা।' },
    { question: 'কেউ “How are you?” বললে কী বলবেন?', options: ['I am fine.', 'Good night.', 'See you.'], answer: 'I am fine.', explain: 'I am fine মানে আমি ভালো আছি।' },
    { question: '“বাবা” শব্দটির ইংরেজি কোনটি?', options: ['Mother', 'Father', 'Brother'], answer: 'Father', explain: 'Father মানে বাবা।' },
    { question: '“Good morning” কখন বলা হয়?', options: ['সকালে', 'রাতে', 'বিদায়ের সময়'], answer: 'সকালে', explain: 'সকালে দেখা হলে Good morning বলা হয়।' },
    { question: '“পানি” এর ইংরেজি কী?', options: ['Food', 'Water', 'Milk'], answer: 'Water', explain: 'Water মানে পানি।' },
    { question: '“Please” শব্দটি কী বোঝায়?', options: ['দয়া করে', 'বিদায়', 'দুঃখিত'], answer: 'দয়া করে', explain: 'কোনো অনুরোধ ভদ্রভাবে করতে Please ব্যবহার হয়।' },
    { question: '“বই” এর ইংরেজি কোনটি?', options: ['Pen', 'Book', 'Door'], answer: 'Book', explain: 'Book মানে বই।' },
    { question: '“I am hungry” এর অর্থ কী?', options: ['আমার ঘুম পাচ্ছে', 'আমার ক্ষুধা লেগেছে', 'আমি খুশি'], answer: 'আমার ক্ষুধা লেগেছে', explain: 'Hungry মানে ক্ষুধার্ত।' },
    { question: '“আপনার নাম কী?” ইংরেজিতে কী?', options: ['Where are you?', 'What is your name?', 'How old are you?'], answer: 'What is your name?', explain: 'What is your name? দিয়ে কারও নাম জানতে চাওয়া হয়।' },
    { question: '“ধীরে কথা বলুন” ইংরেজিতে কী?', options: ['Speak slowly.', 'Come here.', 'Sit down.'], answer: 'Speak slowly.', explain: 'Speak slowly মানে ধীরে কথা বলুন।' },
    { question: '“আজ” এর ইংরেজি কী?', options: ['Yesterday', 'Tomorrow', 'Today'], answer: 'Today', explain: 'Today মানে আজ।' },
    { question: '“চেয়ার” এর ইংরেজি কোনটি?', options: ['Table', 'Chair', 'Window'], answer: 'Chair', explain: 'Chair মানে বসার চেয়ার।' },
    { question: '“আমি বুঝতে পারছি না” ইংরেজিতে কী?', options: ['I do not understand.', 'I am ready.', 'I am happy.'], answer: 'I do not understand.', explain: 'কিছু বুঝতে না পারলে এই বাক্যটি বলুন।' },
    { question: '“দরজা” এর ইংরেজি কী?', options: ['Door', 'Floor', 'Wall'], answer: 'Door', explain: 'Door মানে দরজা।' },
    { question: '“Good night” কখন বলা হয়?', options: ['সকালে', 'রাতে বিদায়ের সময়', 'দুপুরে'], answer: 'রাতে বিদায়ের সময়', explain: 'রাতে বিদায় নেওয়ার সময় Good night বলা যায়।' },
    { question: '“বোন” এর ইংরেজি কী?', options: ['Sister', 'Brother', 'Daughter'], answer: 'Sister', explain: 'Sister মানে বোন।' },
    { question: '“আমি বাড়িতে আছি” ইংরেজিতে কী?', options: ['I am at home.', 'I am at work.', 'I am outside.'], answer: 'I am at home.', explain: 'At home মানে বাড়িতে।' },
    { question: '“দুধ” এর ইংরেজি কোনটি?', options: ['Juice', 'Tea', 'Milk'], answer: 'Milk', explain: 'Milk মানে দুধ।' },
    { question: '“Excuse me” কখন বলা হয়?', options: ['কারও দৃষ্টি আকর্ষণ করতে', 'খাবার চাইতে', 'ঘুমাতে যাওয়ার সময়'], answer: 'কারও দৃষ্টি আকর্ষণ করতে', explain: 'ভদ্রভাবে কারও মনোযোগ চাইতে Excuse me বলা হয়।' },
    { question: '“কাল” (আগামী দিন) ইংরেজিতে কী?', options: ['Yesterday', 'Tomorrow', 'Today'], answer: 'Tomorrow', explain: 'Tomorrow মানে আগামীকাল।' },
    { question: '“আমি ক্লান্ত” ইংরেজিতে কী?', options: ['I am tired.', 'I am thirsty.', 'I am early.'], answer: 'I am tired.', explain: 'Tired মানে ক্লান্ত।' },
    { question: '“জানালা” এর ইংরেজি কোনটি?', options: ['Window', 'Mirror', 'Garden'], answer: 'Window', explain: 'Window মানে জানালা।' },
    { question: '“অনুগ্রহ করে বসুন” ইংরেজিতে কী?', options: ['Please stand up.', 'Please sit down.', 'Please come in.'], answer: 'Please sit down.', explain: 'Sit down মানে বসুন।' },
    { question: '“বন্ধু” এর ইংরেজি কী?', options: ['Friend', 'Family', 'Teacher'], answer: 'Friend', explain: 'Friend মানে বন্ধু।' },
    { question: '“আমি পানি চাই” ইংরেজিতে কী?', options: ['I want water.', 'I want food.', 'I want tea.'], answer: 'I want water.', explain: 'I want water মানে আমি পানি চাই।' },
    { question: '“বাম দিকে” ইংরেজিতে কী?', options: ['Right', 'Left', 'Straight'], answer: 'Left', explain: 'Left মানে বাম দিক।' },
    { question: '“আজ আবহাওয়া ভালো” ইংরেজিতে কী?', options: ['The weather is nice today.', 'I am fine today.', 'It is late today.'], answer: 'The weather is nice today.', explain: 'Weather মানে আবহাওয়া।' },
    { question: '“আমি অসুস্থ” ইংরেজিতে কী?', options: ['I am busy.', 'I am sick.', 'I am free.'], answer: 'I am sick.', explain: 'Sick মানে অসুস্থ।' },
    { question: '“আবার দেখা হবে” ইংরেজিতে কী?', options: ['See you again.', 'Thank you.', 'Good morning.'], answer: 'See you again.', explain: 'বিদায়ের সময় See you again বলা যায়।' },
    { question: '“আমি শিক্ষক” ইংরেজিতে কী?', options: ['I am a teacher.', 'I am a driver.', 'I am a student.'], answer: 'I am a teacher.', explain: 'Teacher মানে শিক্ষক।' },
    { question: '“রান্নাঘর” এর ইংরেজি কী?', options: ['Bedroom', 'Kitchen', 'Bathroom'], answer: 'Kitchen', explain: 'Kitchen মানে রান্নাঘর।' },
    { question: '“আমার মাথা ব্যথা করছে” ইংরেজিতে কী?', options: ['I have a headache.', 'I have a cold.', 'I am hungry.'], answer: 'I have a headache.', explain: 'Headache মানে মাথাব্যথা।' },
    { question: '“দয়া করে অপেক্ষা করুন” ইংরেজিতে কী?', options: ['Please wait.', 'Please leave.', 'Please read.'], answer: 'Please wait.', explain: 'Wait মানে অপেক্ষা করা।' },
    { question: '“লাল” এর ইংরেজি কোনটি?', options: ['Blue', 'Red', 'Green'], answer: 'Red', explain: 'Red মানে লাল।' },
    { question: '“আমার বয়স ষাট বছর” ইংরেজিতে কী?', options: ['I am sixty years old.', 'I have sixty books.', 'I am sixty feet tall.'], answer: 'I am sixty years old.', explain: 'বয়স বলতে years old ব্যবহার করা হয়।' },
    { question: '“চাবি” এর ইংরেজি কী?', options: ['Key', 'Lock', 'Bag'], answer: 'Key', explain: 'Key মানে চাবি।' },
    { question: '“আমি ইংরেজি শিখছি” ইংরেজিতে কী?', options: ['I am learning English.', 'I am teaching math.', 'I am reading Bangla.'], answer: 'I am learning English.', explain: 'Learning মানে শেখা।' },
    { question: '“ডান দিকে” ইংরেজিতে কী?', options: ['Left', 'Right', 'Behind'], answer: 'Right', explain: 'Right মানে ডান দিক।' },
    { question: '“আপনাকে ধন্যবাদ” ইংরেজিতে কী?', options: ['Thank you.', 'I am sorry.', 'Good luck.'], answer: 'Thank you.', explain: 'কৃতজ্ঞতা জানাতে Thank you বলুন।' },
    { question: '“আমার চশমা কোথায়?” ইংরেজিতে কী?', options: ['Where are my glasses?', 'Where is my house?', 'Where is my phone?'], answer: 'Where are my glasses?', explain: 'Glasses মানে চশমা।' },
    { question: '“সোমবার” এর ইংরেজি কী?', options: ['Sunday', 'Monday', 'Friday'], answer: 'Monday', explain: 'Monday হলো সপ্তাহের একটি দিনের নাম।' },
    { question: '“আমি চা পছন্দ করি” ইংরেজিতে কী?', options: ['I like tea.', 'I need a taxi.', 'I drink water.'], answer: 'I like tea.', explain: 'Like মানে পছন্দ করা।' },
    { question: '“হাসপাতাল” এর ইংরেজি কী?', options: ['School', 'Hospital', 'Station'], answer: 'Hospital', explain: 'Hospital মানে হাসপাতাল।' },
    { question: '“আপনি কি আমাকে সাহায্য করতে পারেন?” ইংরেজিতে কী?', options: ['Can you help me?', 'Can you hear me?', 'Can you see it?'], answer: 'Can you help me?', explain: 'সাহায্য চাইতে Can you help me? বলুন।' },
    { question: '“সাদা” এর ইংরেজি কোনটি?', options: ['Black', 'White', 'Brown'], answer: 'White', explain: 'White মানে সাদা।' },
    { question: '“আমি এখন ব্যস্ত” ইংরেজিতে কী?', options: ['I am busy now.', 'I am free now.', 'I am ready now.'], answer: 'I am busy now.', explain: 'Busy মানে ব্যস্ত।' },
    { question: '“রেলস্টেশন” এর ইংরেজি কী?', options: ['Airport', 'Railway station', 'Bus stop'], answer: 'Railway station', explain: 'Railway station মানে রেলস্টেশন।' },
    { question: '“দয়া করে দরজাটি খুলুন” ইংরেজিতে কী?', options: ['Please open the door.', 'Please close the window.', 'Please call me.'], answer: 'Please open the door.', explain: 'Open মানে খোলা।' },
    { question: '“আমার ফোন কাজ করছে না” ইংরেজিতে কী?', options: ['My phone is not working.', 'My phone is new.', 'My phone is charging.'], answer: 'My phone is not working.', explain: 'কোনো যন্ত্র কাজ না করলে not working বলা যায়।' },
    { question: '“বৃষ্টি হচ্ছে” ইংরেজিতে কী?', options: ['It is raining.', 'It is sunny.', 'It is snowing.'], answer: 'It is raining.', explain: 'Raining মানে বৃষ্টি হওয়া।' },
    { question: '“আপনি কোথায় থাকেন?” ইংরেজিতে কী?', options: ['Where do you live?', 'What do you eat?', 'When do you sleep?'], answer: 'Where do you live?', explain: 'কোথায় থাকেন জানতে Where do you live? বলুন।' },
    { question: '“আমার পানি লাগবে” ইংরেজিতে কী?', options: ['I need water.', 'I need a book.', 'I need a doctor.'], answer: 'I need water.', explain: 'Need মানে প্রয়োজন।' },
    { question: '“সবুজ” এর ইংরেজি কোনটি?', options: ['Yellow', 'Green', 'Purple'], answer: 'Green', explain: 'Green মানে সবুজ।' },
    { question: '“আমি ভালো শুনতে পাই না” ইংরেজিতে কী?', options: ['I cannot hear well.', 'I cannot see well.', 'I cannot walk fast.'], answer: 'I cannot hear well.', explain: 'Hear মানে শোনা।' },
    { question: '“বিকেল” এর ইংরেজি কী?', options: ['Afternoon', 'Midnight', 'Morning'], answer: 'Afternoon', explain: 'Afternoon মানে দুপুরের পরের সময়।' },
    { question: '“এটি কত টাকা?” ইংরেজিতে কী?', options: ['How much is it?', 'How old is it?', 'How far is it?'], answer: 'How much is it?', explain: 'দাম জানতে How much is it? বলুন।' },
    { question: '“আমার একটু বিশ্রাম দরকার” ইংরেজিতে কী?', options: ['I need some rest.', 'I need some rice.', 'I need some help.'], answer: 'I need some rest.', explain: 'Rest মানে বিশ্রাম।' },
    { question: '“শুভ জন্মদিন” ইংরেজিতে কী?', options: ['Happy birthday.', 'Happy journey.', 'Good evening.'], answer: 'Happy birthday.', explain: 'জন্মদিনে Happy birthday বলা হয়।' },
    { question: '“আমার নাম রহমান” ইংরেজিতে কী?', options: ['My name is Rahman.', 'My age is Rahman.', 'My home is Rahman.'], answer: 'My name is Rahman.', explain: 'নিজের নাম বলতে My name is ব্যবহার করুন।' }
];
