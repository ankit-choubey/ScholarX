exports.formatCitation = (paper, authorName, format) => {
  const year = new Date(paper.submissionDate || paper.createdAt).getFullYear();
  const title = paper.title;
  const journal = 'ScholarX Journal';
  const author = authorName || 'Unknown Author';

  const formats = {
    apa:     `${author} (${year}). ${title}. ${journal}.`,
    mla:     `${author}. "${title}." ${journal}, ${year}.`,
    chicago: `${author}. "${title}." ${journal} (${year}).`,
    ieee:    `${author}, "${title}," ${journal}, ${year}.`,
  };

  return formats[format] || formats.apa;
};
