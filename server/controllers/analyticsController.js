const Paper       = require('../models/Paper');
const Publication = require('../models/Publication');
const User        = require('../models/User');
const Review      = require('../models/Review');

exports.getAnalytics = async (req, res, next) => {
  try {
    const [totalPublications, totalAuthors, totalReviews, totalSubmissions, acceptedPapers, revisionRequiredPapers, pendingReviews] = await Promise.all([
      Publication.countDocuments(),
      User.countDocuments({ role: 'researcher' }),
      Review.countDocuments(),
      Paper.countDocuments(),
      Paper.countDocuments({ status: 'accepted' }),
      Paper.countDocuments({ status: 'revision_required' }),
      Paper.countDocuments({ status: 'under_review' }),
    ]);

    const sixAgo = new Date();
    sixAgo.setMonth(sixAgo.getMonth() - 6);

    const submissionsOverTime = await Paper.aggregate([
      { $match: { createdAt: { $gte: sixAgo } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $project: { _id: 0, year: '$_id.year', month: '$_id.month', count: 1,
          label: { $concat: [
            { $arrayElemAt: [['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], '$_id.month'] },
            ' ', { $toString: '$_id.year' }
          ] }
        }
      },
    ]);

    const statuses = ['submitted','under_review','revision_required','accepted','rejected','published'];
    const counts   = await Promise.all(statuses.map((s) => Paper.countDocuments({ status: s })));
    const statusDistribution = {};
    statuses.forEach((s, i) => { statusDistribution[s] = counts[i]; });

    const reviewDecisionDistribution = await Review.aggregate([
      { $group: { _id: '$decision', count: { $sum: 1 } } },
      { $project: { _id: 0, decision: '$_id', count: 1 } },
    ]);

    const sixMonthsAgoPub = new Date();
    sixMonthsAgoPub.setMonth(sixMonthsAgoPub.getMonth() - 6);
    const publicationsOverTime = await Publication.aggregate([
      { $match: { publicationDate: { $gte: sixMonthsAgoPub } } },
      { $group: { _id: { year: { $year: '$publicationDate' }, month: { $month: '$publicationDate' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $project: { _id: 0, label: { $concat: [
        { $arrayElemAt: [['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], '$_id.month'] },
        ' ',
        { $toString: '$_id.year' },
      ] }, count: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        totalSubmissions,
        totalPublications,
        totalAuthors,
        totalReviews,
        pendingReviews,
        acceptedPapers,
        revisionRequiredPapers,
        submissionsOverTime,
        statusDistribution,
        reviewDecisionDistribution,
        publicationsOverTime,
      },
    });
  } catch (err) { next(err); }
};
