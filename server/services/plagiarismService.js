const Paper = require('../models/Paper');

const tokenize = (text) => new Set((text || '').toLowerCase().match(/\w{4,}/g) || []);

const jaccard = (setA, setB) => {
  if (!setA.size && !setB.size) return 0;
  const intersection = [...setA].filter((w) => setB.has(w)).length;
  const union = new Set([...setA, ...setB]).size;
  return Math.round((intersection / union) * 100);
};

exports.runPlagiarismCheck = async (targetPaper) => {
  const published = await Paper.find({ status: 'published', _id: { $ne: targetPaper._id } })
    .select('title abstract')
    .lean();

  if (!published.length) {
    return { score: 0, status: 'clean', details: 'No published papers to compare against.' };
  }

  const targetTokens = tokenize(`${targetPaper.title} ${targetPaper.abstract}`);
  let maxScore = 0;

  for (const p of published) {
    const score = jaccard(targetTokens, tokenize(`${p.title} ${p.abstract}`));
    if (score > maxScore) maxScore = score;
  }

  const status = maxScore < 15 ? 'clean' : maxScore < 30 ? 'warning' : 'flagged';
  return {
    score: maxScore,
    status,
    details: `${maxScore}% similarity across ${published.length} published paper(s). [DEMO — not a certified check]`,
  };
};
