require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Paper = require('./models/Paper');
const Review = require('./models/Review');
const Publication = require('./models/Publication');

async function seedData() {
  await Promise.all([User.deleteMany(), Paper.deleteMany(), Review.deleteMany(), Publication.deleteMany()]);
  console.log('Cleared collections');

  const [editor, researcher, reviewer] = await Promise.all([
    User.create({ name: 'Dr. Sarah Editor', email: 'editor@scholarx.dev', password: 'DevPassword@123', role: 'editor', institution: 'ScholarX Journal' }),
    User.create({ name: 'Dr. John Researcher', email: 'researcher@scholarx.dev', password: 'DevPassword@123', role: 'researcher', institution: 'MIT' }),
    User.create({ name: 'Dr. Alice Reviewer', email: 'reviewer@scholarx.dev', password: 'DevPassword@123', role: 'reviewer', institution: 'Stanford University' }),
  ]);
  console.log('Created users');

  const paper1 = await Paper.create({
    title: 'Deep Learning for Natural Language Processing: A Survey',
    abstract: 'This paper presents a comprehensive survey of deep learning techniques applied to natural language processing tasks. We cover transformer architectures, attention mechanisms, and applications in text classification, machine translation, and question answering. Analysis covers over 200 papers from 2018 to 2024.',
    keywords: ['deep learning', 'nlp', 'transformers', 'bert', 'attention'],
    authorId: researcher._id,
    fileUrl: 'https://res.cloudinary.com/demo/raw/upload/sample.pdf',
    status: 'under_review',
    assignedReviewers: [reviewer._id],
  });

  const paper2 = await Paper.create({
    title: 'Blockchain Technology in Healthcare Data Management Systems',
    abstract: 'This research explores blockchain for secure management of healthcare records. We propose a decentralized architecture ensuring data integrity, patient privacy, and interoperability across healthcare systems. Results show 99.9% data integrity with 40% improved access control versus traditional systems.',
    keywords: ['blockchain', 'healthcare', 'data management', 'privacy', 'security'],
    authorId: researcher._id,
    fileUrl: 'https://res.cloudinary.com/demo/raw/upload/sample2.pdf',
    status: 'published',
  });
  console.log('Created papers');

  await Review.create({
    paperId: paper1._id,
    reviewerId: reviewer._id,
    comments: 'Well-structured survey with comprehensive coverage of transformer models. Recommend adding discussion on multilingual models and cross-lingual transfer learning. Bibliography is thorough and writing is clear throughout.',
    score: 8,
    decision: 'minor_revision',
  });
  console.log('Created review');

  await Publication.create({
    paperId: paper2._id,
    journalName: 'Journal of Medical Informatics',
    doi: '10.1234/scholarx.2024001',
    volume: '12',
    issue: '3',
  });
  console.log('Created publication');

  console.log('\nSeed complete. Test accounts:');
  console.log('  editor@scholarx.dev      / DevPassword@123');
  console.log('  researcher@scholarx.dev  / DevPassword@123');
  console.log('  reviewer@scholarx.dev    / DevPassword@123\n');
}

if (require.main === module) {
  if (process.env.NODE_ENV === 'production') {
    console.error('Refusing to seed in production.'); process.exit(1);
  }
  const connectDB = require('./config/db');
  connectDB().then(seedData).then(() => process.exit(0)).catch(e => {
    console.error('Seed failed:', e);
    process.exit(1);
  });
}

module.exports = seedData;
