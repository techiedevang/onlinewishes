import React, { useState } from 'react';
import { Template, TemplateReview } from '../types';
import { X, Star, CheckCircle2, MessageSquarePlus, ThumbsUp, Sparkles, Filter, User } from 'lucide-react';

interface TemplateReviewsModalProps {
  template: Template;
  onClose: () => void;
  onAddReview?: (templateId: string, review: TemplateReview) => void;
}

export function TemplateReviewsModal({
  template,
  onClose,
  onAddReview,
}: TemplateReviewsModalProps) {
  const [reviewsList, setReviewsList] = useState<TemplateReview[]>(
    template.reviews && template.reviews.length > 0
      ? template.reviews
      : [
          {
            id: 'r_default_1',
            templateId: template.id,
            author: 'Maya Lin',
            rating: 5,
            date: '2 days ago',
            comment: `Absolutely loved using ${template.title}! The recipient was moved to tears by the interactive layout and music.`,
            verified: true,
            recipientType: 'Best Friend',
          },
          {
            id: 'r_default_2',
            templateId: template.id,
            author: 'Samantha P.',
            rating: 5,
            date: '1 week ago',
            comment: 'Super fast to customize. Uploaded my photos in 2 minutes and published a custom link instantly!',
            verified: true,
            recipientType: 'Girlfriend',
          }
        ]
  );

  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  // New review form state
  const [newAuthor, setNewAuthor] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [newRecipient, setNewRecipient] = useState('Best Friend');
  const [submittedMessage, setSubmittedMessage] = useState(false);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor || !newComment) return;

    const createdReview: TemplateReview = {
      id: 'rev_' + Date.now(),
      templateId: template.id,
      author: newAuthor,
      rating: newRating,
      date: 'Just now',
      comment: newComment,
      verified: true,
      recipientType: newRecipient,
    };

    setReviewsList([createdReview, ...reviewsList]);
    if (onAddReview) onAddReview(template.id, createdReview);
    setSubmittedMessage(true);
    setTimeout(() => {
      setShowAddForm(false);
      setSubmittedMessage(false);
      setNewComment('');
      setNewAuthor('');
    }, 1500);
  };

  const filteredReviews = reviewsList.filter((r) =>
    filterRating === 'all' ? true : r.rating === filterRating
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl text-slate-800 dark:text-slate-100 overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-500 flex items-center justify-center font-bold text-lg">
              ★ {template.rating}
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Customer Reviews
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {template.title} ({template.reviewsCount || reviewsList.length} total verified ratings)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl"
            aria-label="Close reviews"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rating Summary Bar */}
        <div className="bg-slate-100/70 dark:bg-slate-950/70 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <div className="flex text-amber-400 text-sm">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
              {template.rating} out of 5 stars
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              <span>Write a Review</span>
            </button>
          </div>
        </div>

        {/* Modal Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* WRITE REVIEW FORM */}
          {showAddForm && (
            <form onSubmit={handleSubmitReview} className="bg-rose-50 dark:bg-rose-950/40 p-5 rounded-2xl border border-rose-200 dark:border-rose-900 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-rose-700 dark:text-rose-300 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Share Your Review for {template.title}</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>

              {submittedMessage ? (
                <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Thank you! Your review has been added.</span>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={newAuthor}
                        onChange={(e) => setNewAuthor(e.target.value)}
                        placeholder="e.g. Alex M."
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Surprise Recipient
                      </label>
                      <select
                        value={newRecipient}
                        onChange={(e) => setNewRecipient(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-400"
                      >
                        <option value="Best Friend">Best Friend</option>
                        <option value="Girlfriend / Partner">Girlfriend / Partner</option>
                        <option value="Sister">Sister</option>
                        <option value="Birthday Celebration">Birthday Celebration</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Rating
                    </label>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Your Comment / Experience *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="How did the recipient react to this gift template?"
                      className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow transition-colors"
                  >
                    Post Review
                  </button>
                </>
              )}
            </form>
          )}

          {/* REVIEWS LIST */}
          <div className="space-y-4">
            {filteredReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-slate-50 dark:bg-slate-800/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 font-bold flex items-center justify-center text-xs">
                      {rev.author.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {rev.author}
                        </span>
                        {rev.verified && (
                          <span className="inline-flex items-center space-x-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-1.5 py-0.2 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Verified Buyer</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Surprise for {rev.recipientType || 'Loved One'} • {rev.date}
                      </p>
                    </div>
                  </div>

                  <div className="flex text-amber-400">
                    {[...Array(rev.rating)].map((_, idx) => (
                      <Star key={idx} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pt-1">
                  "{rev.comment}"
                </p>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}
