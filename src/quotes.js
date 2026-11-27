/* Quote library. kind: "t" = wording from the named translation or original, "p" = plain-language paraphrase.
   Verification status for every group is recorded in docs/SOURCES.md. */
(function (root) {
const BELIEFS = [
  ['bahai', 'Baháʼí Faith', '#245a66'], ['buddhism', 'Buddhism', '#7a4a0e'], ['christianity', 'Christianity', '#5a2a63'],
  ['confucianism', 'Confucianism', '#7a2e22'], ['hinduism', 'Hinduism', '#80391a'], ['humanism', 'Humanism', '#2d4a73'],
  ['islam', 'Islam', '#0f4a43'], ['jainism', 'Jainism', '#6b2747'], ['judaism', 'Judaism', '#23376e'],
  ['sikhism', 'Sikhism', '#6e4a12'], ['stoicism', 'Stoicism', '#3d4654'], ['taoism', 'Taoism', '#2c5236']
].map(([id, name, color]) => ({ id, name, color }));

const Q = [];
/* rows: [id, text, citation, author?] */
const add = (belief, author, kind, rows) => rows.forEach(([id, text, src, by]) => Q.push({ id, belief, text, src, by: by || author, kind }));
const P = 'Paraphrase of the meaning';

add('islam', 'Quran', 'p', [
  ['q1', 'Indeed, with hardship comes ease.', 'Quran 94:6'],
  ['q2', 'Surely in the remembrance of Allah do hearts find rest.', 'Quran 13:28 · excerpt'],
  ['q3', 'Allah does not burden any soul beyond what it can bear.', 'Quran 2:286 · excerpt'],
  ['q4', 'Whoever puts their trust in Allah, He is sufficient for them.', 'Quran 65:3 · excerpt'],
  ['q5', 'My Lord, increase me in knowledge.', 'Quran 20:114 · excerpt'],
  ['q6', 'Remember Me, and I will remember you.', 'Quran 2:152 · excerpt'],
  ['q7', 'Do not despair of the mercy of Allah.', 'Quran 39:53 · excerpt']]);
add('islam', 'Prophet Muhammad ﷺ', 't', [
  ['h1', 'The reward of deeds depends upon the intentions, and every person will get the reward according to what he has intended.', 'Sahih al-Bukhari 1 · excerpt'],
  ['h2', 'None of you will have faith till he wishes for his (Muslim) brother what he likes for himself.', 'Sahih al-Bukhari 13'],
  ['h3', 'Whoever believes in Allah and the Last Day should talk what is good or keep quiet.', 'Sahih al-Bukhari 6018 · excerpt'],
  ['h4', 'The strong is the one who controls himself while in anger.', 'Sahih al-Bukhari 6114 · excerpt'],
  ['h5', 'The most beloved deed to Allah is the most regular and constant, even if it were little.', 'Sahih al-Bukhari 6464 · excerpt']]);

add('christianity', 'The Bible', 't', [
  ['c1', 'Therefore all things whatsoever ye would that men should do to you, do ye even so to them.', 'Matthew 7:12 · KJV · excerpt'],
  ['c2', 'Blessed are the peacemakers: for they shall be called the children of God.', 'Matthew 5:9 · KJV'],
  ['c3', 'Come unto me, all ye that labour and are heavy laden, and I will give you rest.', 'Matthew 11:28 · KJV'],
  ['c4', 'And now abideth faith, hope, charity, these three; but the greatest of these is charity.', '1 Corinthians 13:13 · KJV'],
  ['c5', 'I can do all things through Christ which strengtheneth me.', 'Philippians 4:13 · KJV'],
  ['c6', 'The LORD is my shepherd; I shall not want.', 'Psalm 23:1 · KJV'],
  ['c7', 'And ye shall know the truth, and the truth shall make you free.', 'John 8:32 · KJV'],
  ['c8', 'We love him, because he first loved us.', '1 John 4:19 · KJV'],
  ['c9', 'Be not overcome of evil, but overcome evil with good.', 'Romans 12:21 · KJV'],
  ['c10', 'And let us not be weary in well doing: for in due season we shall reap, if we faint not.', 'Galatians 6:9 · KJV']]);

add('judaism', 'Hebrew Bible', 'p', [
  ['j1', 'What is asked of you: to do justly, to love mercy, and to walk humbly with your God.', 'Micah 6:8'],
  ['j2', 'Love your neighbor as yourself.', 'Leviticus 19:18 · excerpt'],
  ['j3', 'Justice, justice you shall pursue.', 'Deuteronomy 16:20 · excerpt'],
  ['j4', 'Keep your tongue from evil, and your lips from speaking deceit.', 'Psalm 34:14 (Jewish numbering)'],
  ['j5', 'To everything there is a season, and a time for every purpose under heaven.', 'Ecclesiastes 3:1']]);
add('judaism', 'Pirkei Avot', 'p', [
  ['j6', 'If I am not for myself, who will be for me? If I am only for myself, what am I? And if not now, when?', 'Pirkei Avot 1:14', 'Hillel'],
  ['j7', 'Receive every person with a cheerful face.', 'Pirkei Avot 1:15 · excerpt', 'Shammai'],
  ['j8', 'Who is rich? The one who is happy with their portion.', 'Pirkei Avot 4:1 · excerpt', 'Ben Zoma'],
  ['j9', 'You are not required to finish the work, but you are not free to abandon it.', 'Pirkei Avot 2:16 (2:21 in some editions)', 'Rabbi Tarfon']]);

add('hinduism', 'Bhagavad Gita', 'p', [
  ['n1', 'Your right is to your work, never to its fruits.', 'Bhagavad Gita 2:47 · excerpt'],
  ['n2', 'Stay even-minded in success and failure. That balance is called yoga.', 'Bhagavad Gita 2:48'],
  ['n3', 'Lift yourself by your own self; do not let yourself sink. You can be your own friend or your own enemy.', 'Bhagavad Gita 6:5'],
  ['n4', 'Whatever a great person does, others follow.', 'Bhagavad Gita 3:21 · excerpt'],
  ['n5', 'Bear no hatred toward any being. Be friendly and compassionate.', 'Bhagavad Gita 12:13 · excerpt']]);
add('hinduism', 'Upanishads and Vedas', 'p', [
  ['n6', 'Truth alone triumphs.', 'Mundaka Upanishad 3.1.6 · excerpt'],
  ['n7', 'Lead me from the unreal to the real, from darkness to light, from death to immortality.', 'Brihadaranyaka Upanishad 1.3.28'],
  ['n8', 'May noble thoughts come to us from every side.', 'Rig Veda 1.89.1 · excerpt']]);

add('buddhism', 'Dhammapada', 't', [
  ['b1', 'Hatred does not cease by hatred at any time: hatred ceases by love, this is an old rule.', 'Dhammapada 5 · Max Müller'],
  ['b2', 'If one man conquer in battle a thousand times thousand men, and if another conquer himself, he is the greatest of conquerors.', 'Dhammapada 103 · Max Müller'],
  ['b3', 'Let a man overcome anger by love, let him overcome evil by good; let him overcome the greedy by liberality, the liar by truth!', 'Dhammapada 223 · Max Müller']]);
add('buddhism', 'Dhammapada', 'p', [
  ['b4', 'As solid rock is not shaken by the wind, the wise are not shaken by blame or praise.', 'Dhammapada 81'],
  ['b5', 'One meaningful word that brings peace is better than a thousand empty ones.', 'Dhammapada 100'],
  ['b6', 'Look not at the faults of others, but at what you yourself have done and left undone.', 'Dhammapada 50'],
  ['b7', 'You are your own refuge. Who else could be your refuge?', 'Dhammapada 160 · excerpt'],
  ['b8', 'Health is the greatest gift, contentment the greatest wealth.', 'Dhammapada 204 · excerpt']]);

add('sikhism', 'Guru Granth Sahib', 'p', [
  ['s1', 'Conquer your own mind, and you conquer the world.', 'Ang 6 · Japji Sahib'],
  ['s2', 'Truth is higher than everything, but higher still is truthful living.', 'Ang 62'],
  ['s3', 'No one is my enemy and no one is a stranger. I get along with everyone.', 'Ang 1299'],
  ['s4', 'First the Divine created the Light; all people come from it. So who is high and who is low?', 'Ang 1349 · Bhagat Kabir'],
  ['s5', 'While you are in this world, give yourself to selfless service.', 'Ang 26'],
  ['s6', 'Those who earn by honest work and share some of it have found the path.', 'Ang 1245'],
  ['s7', 'The wise one frightens no one and is afraid of no one.', 'Ang 1427']]);

add('taoism', 'Laozi', 't', [
  ['w16', 'The journey of a thousand li commenced with a single step.', 'Tao Te Ching 64 · Legge · excerpt'],
  ['t1', 'He who knows other men is discerning; he who knows himself is intelligent.', 'Tao Te Ching 33 · Legge · excerpt'],
  ['t2', 'He who overcomes others is strong; he who overcomes himself is mighty.', 'Tao Te Ching 33 · Legge · excerpt']]);
add('taoism', 'Laozi', 'p', [
  ['t3', 'The highest goodness is like water. It benefits all things and does not compete.', 'Tao Te Ching 8'],
  ['t4', 'One who stands on tiptoe does not stand firm.', 'Tao Te Ching 24 · excerpt'],
  ['t5', 'Those who know do not talk much; those who talk much do not know.', 'Tao Te Ching 56 · excerpt'],
  ['t6', 'Answer injury with kindness.', 'Tao Te Ching 63 · excerpt'],
  ['t7', 'Nothing is softer than water, yet nothing is better at wearing down the hard.', 'Tao Te Ching 78']]);

add('confucianism', 'Confucius', 't', [
  ['k1', 'Learning without thought is labour lost; thought without learning is perilous.', 'Analects 2.15 · Legge'],
  ['k2', 'What you do not want done to yourself, do not do to others.', 'Analects 15.23 · Legge · excerpt']]);
add('confucianism', 'Confucius', 'p', [
  ['k3', 'Is it not a pleasure to learn, and to keep practising what you learn?', 'Analects 1.1'],
  ['k4', 'Real knowledge is knowing what you know and admitting what you do not.', 'Analects 2.17'],
  ['k5', 'When you see someone of worth, aim to equal them. When you see the opposite, look within.', 'Analects 4.17'],
  ['k6', 'The noble person is slow to speak and quick to act.', 'Analects 4.24'],
  ['k7', 'Walking with two others, I will surely find a teacher among them.', 'Analects 7.21'],
  ['k8', 'To make a mistake and not correct it: that is the real mistake.', 'Analects 15.29']]);

add('jainism', 'Jain scripture', 'p', [
  ['a1', 'Souls exist to help one another.', 'Tattvartha Sutra 5.21'],
  ['a2', 'Right faith, right knowledge and right conduct together are the path to liberation.', 'Tattvartha Sutra 1.1'],
  ['a3', 'All living beings want to live, not to die.', 'Dasavaikalika Sutra 6 · excerpt'],
  ['a4', 'Overcome anger with calm, pride with humility, deceit with honesty, and greed with contentment.', 'Dasavaikalika Sutra 8'],
  ['a5', 'Conquering yourself is greater than conquering thousands upon thousands of enemies.', 'Uttaradhyayana Sutra 9']]);
add('jainism', 'Jain prayer', 'p', [
  ['a6', 'I forgive all living beings, and may all beings forgive me. I am friend to all and enemy to none.', 'Pratikraman prayer']]);

add('bahai', 'Baháʼu’lláh', 'p', [
  ['f1', 'The earth is one country, and humanity its citizens.', 'Tablet of Maqsúd'],
  ['f2', 'Have a heart that is pure, kind and radiant.', 'Hidden Words, Arabic 1 · excerpt'],
  ['f3', 'Love justice. With it you will see with your own eyes and not through the eyes of others.', 'Hidden Words, Arabic 2'],
  ['f4', 'Call yourself to account each day before you are called to account.', 'Hidden Words, Arabic 31 · excerpt'],
  ['f5', 'In the garden of your heart, plant nothing but the rose of love.', 'Hidden Words, Persian 3 · excerpt'],
  ['f6', 'Be generous in good times and thankful in hard times.', 'Gleanings 130 · excerpt']]);

add('stoicism', 'Marcus Aurelius', 't', [
  ['w15', 'Such as are thy habitual thoughts, such also will be the character of thy mind; for the soul is dyed by the thoughts.', 'Meditations 5.16 · George Long · excerpt'],
  ['o1', 'No longer talk at all about the kind of man that a good man ought to be, but be such.', 'Meditations 10.16 · George Long'],
  ['o2', 'The best way of avenging thyself is not to become like the wrong doer.', 'Meditations 6.6 · George Long']]);
add('stoicism', 'Epictetus', 'p', [
  ['w13', 'People are disturbed not by things, but by the views they take of them.', 'Enchiridion 5'],
  ['o3', 'Some things are up to us and some are not.', 'Enchiridion 1 · excerpt']]);
add('stoicism', 'Seneca', 'p', [
  ['w14', 'It is not because things are hard that we do not dare; it is because we do not dare that they are hard.', 'Letters 104'],
  ['o4', 'While we keep putting things off, life speeds by.', 'Letters 1'],
  ['o5', 'We suffer more often in imagination than in reality.', 'Letters 13']]);

add('humanism', '', 't', [
  ['u1', 'My country is the world, and my religion is to do good.', 'Rights of Man, part 2 · excerpt', 'Thomas Paine'],
  ['u2', 'Happiness is the only good. The time to be happy is now.', 'A creed · excerpt', 'Robert G. Ingersoll'],
  ['u3', 'The good life is one inspired by love and guided by knowledge.', 'What I Believe, 1925', 'Bertrand Russell'],
  ['u4', 'He who knows only his own side of the case, knows little of that.', 'On Liberty, 1859', 'John Stuart Mill']]);
add('humanism', '', 'p', [
  ['u5', 'I am human, and nothing human is foreign to me.', 'The Self-Tormentor', 'Terence'],
  ['u6', 'Have the courage to use your own reason.', 'What Is Enlightenment?, 1784', 'Immanuel Kant'],
  ['u7', 'The unexamined life is not worth living.', 'Plato, Apology 38a', 'Socrates']]);

/* Quotes from version 1 that belong to no belief system. Kept so earlier saves still open. */
const OLD = [
  ['w1', 'Well done is better than well said.', 'Benjamin Franklin'], ['w2', 'Lost time is never found again.', 'Benjamin Franklin'],
  ['w3', 'Trust thyself: every heart vibrates to that iron string.', 'Ralph Waldo Emerson'], ['w4', 'Nothing is at last sacred but the integrity of your own mind.', 'Ralph Waldo Emerson'],
  ['w5', 'Our life is frittered away by detail.', 'Henry David Thoreau'], ['w6', 'I went to the woods because I wished to live deliberately.', 'Henry David Thoreau'],
  ['w7', 'If there is no struggle there is no progress.', 'Frederick Douglass'], ['w8', 'There is nothing either good or bad, but thinking makes it so.', 'William Shakespeare'],
  ['w9', 'Our doubts are traitors,\nAnd make us lose the good we oft might win,\nBy fearing to attempt.', 'William Shakespeare'], ['w10', 'This above all: to thine own self be true.', 'William Shakespeare'],
  ['w11', 'I am the master of my fate,\nI am the captain of my soul.', 'William Ernest Henley'], ['w12', 'A thing of beauty is a joy for ever.', 'John Keats'],
  ['w17', 'To err is human; to forgive, divine.', 'Alexander Pope'], ['w18', 'Hope is the thing with feathers\nThat perches in the soul.', 'Emily Dickinson'],
  ['w19', 'No coward soul is mine.', 'Emily Brontë'], ['w20', 'Circumstance does not make the man; it reveals him to himself.', 'James Allen']
].map(([id, text, by]) => ({ id, text, by, src: '', kind: 't', belief: 'classic' }));

const lib = { BELIEFS, QUOTES: Q, OLD, PARAPHRASE: P };
if (typeof module !== 'undefined') module.exports = lib; else root.Library = lib;
})(this);
