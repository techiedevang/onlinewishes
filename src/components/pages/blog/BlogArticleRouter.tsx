import React, { lazy, Suspense } from 'react';
import { BLOG_POSTS } from './blogRegistry';

interface BlogArticleRouterProps {
  slug: string;
  onBack: () => void;
}

// Spinner for loading state
function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-lovely-yellow pt-20 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-black border-t-lovely-neon rounded-full animate-spin mx-auto" />
        <p className="font-heading text-xl font-black uppercase text-black">Loading Article...</p>
      </div>
    </div>
  );
}

// 404 page for unknown slugs
function BlogNotFound({ slug, onBack }: { slug: string; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-lovely-yellow pt-20 pb-16 px-4 flex items-center justify-center">
      <div className="bg-white border-4 border-black rounded-3xl p-10 shadow-[8px_8px_0px_rgba(0,0,0,1)] text-center max-w-lg w-full">
        <div className="text-6xl mb-4">📝</div>
        <h1 className="font-heading text-3xl font-black text-black mb-3">Article Not Found</h1>
        <p className="font-body text-gray-600 font-bold mb-6">The article "{slug}" doesn't exist yet, but we're working on it!</p>
        <button
          onClick={onBack}
          className="bg-lovely-neon text-white font-heading font-black uppercase px-6 py-3 rounded-xl border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all"
        >
          ← Back to Blog
        </button>
      </div>
    </div>
  );
}

// Map of all blog components — imported lazily
const blogComponents: Record<string, React.LazyExoticComponent<() => React.JSX.Element>> = {
  'ValentinesDay2026India': lazy(() => import('./ValentinesDay2026India').then(m => ({ default: m.ValentinesDay2026India }))),
  'ValentineWeek2026': lazy(() => import('./ValentineWeek2026').then(m => ({ default: m.ValentineWeek2026 }))),
  'RoseDay2026': lazy(() => import('./RoseDay2026').then(m => ({ default: m.RoseDay2026 }))),
  'ProposeDay2026': lazy(() => import('./ProposeDay2026').then(m => ({ default: m.ProposeDay2026 }))),
  'ChocolateDay2026': lazy(() => import('./ChocolateDay2026').then(m => ({ default: m.ChocolateDay2026 }))),
  'TeddyDay': lazy(() => import('./TeddyDay').then(m => ({ default: m.TeddyDay }))),
  'PromiseDay': lazy(() => import('./PromiseDay').then(m => ({ default: m.PromiseDay }))),
  'HugDay': lazy(() => import('./HugDay').then(m => ({ default: m.HugDay }))),
  'KissDay': lazy(() => import('./KissDay').then(m => ({ default: m.KissDay }))),
  'ValentineWeekHistory': lazy(() => import('./ValentineWeekHistory').then(m => ({ default: m.ValentineWeekHistory }))),
  'SlapDay': lazy(() => import('./SlapDay').then(m => ({ default: m.SlapDay }))),
  'KickDay': lazy(() => import('./KickDay').then(m => ({ default: m.KickDay }))),
  'PerfumeDay': lazy(() => import('./PerfumeDay').then(m => ({ default: m.PerfumeDay }))),
  'FlirtDay': lazy(() => import('./FlirtDay').then(m => ({ default: m.FlirtDay }))),
  'ConfessionDay': lazy(() => import('./ConfessionDay').then(m => ({ default: m.ConfessionDay }))),
  'MissingDay': lazy(() => import('./MissingDay').then(m => ({ default: m.MissingDay }))),
  'BreakupDay': lazy(() => import('./BreakupDay').then(m => ({ default: m.BreakupDay }))),
  'GenZAntiValentine': lazy(() => import('./GenZAntiValentine').then(m => ({ default: m.GenZAntiValentine }))),
  'FriendshipDay2026': lazy(() => import('./FriendshipDay2026').then(m => ({ default: m.FriendshipDay2026 }))),
  'FriendshipDayGiftIdeas': lazy(() => import('./FriendshipDayGiftIdeas').then(m => ({ default: m.FriendshipDayGiftIdeas }))),
  'FriendshipDayWishes': lazy(() => import('./FriendshipDayWishes').then(m => ({ default: m.FriendshipDayWishes }))),
  'BestFriendMessages': lazy(() => import('./BestFriendMessages').then(m => ({ default: m.BestFriendMessages }))),
  'InLoveWithBestFriend': lazy(() => import('./InLoveWithBestFriend').then(m => ({ default: m.InLoveWithBestFriend }))),
  'ConfessToFriend': lazy(() => import('./ConfessToFriend').then(m => ({ default: m.ConfessToFriend }))),
  'FriendMovingAway': lazy(() => import('./FriendMovingAway').then(m => ({ default: m.FriendMovingAway }))),
  'BirthdayWishesBestFriend': lazy(() => import('./BirthdayWishesBestFriend').then(m => ({ default: m.BirthdayWishesBestFriend }))),
  'BirthdayWishesGirlfriend': lazy(() => import('./BirthdayWishesGirlfriend').then(m => ({ default: m.BirthdayWishesGirlfriend }))),
  'BirthdayWishesMom': lazy(() => import('./BirthdayWishesMom').then(m => ({ default: m.BirthdayWishesMom }))),
  'SurpriseBirthdayPage': lazy(() => import('./SurpriseBirthdayPage').then(m => ({ default: m.SurpriseBirthdayPage }))),
  'Milestone50Birthday': lazy(() => import('./Milestone50Birthday').then(m => ({ default: m.Milestone50Birthday }))),
  'Milestone30Birthday': lazy(() => import('./Milestone30Birthday').then(m => ({ default: m.Milestone30Birthday }))),
  'HowToWriteLoveLetter': lazy(() => import('./HowToWriteLoveLetter').then(m => ({ default: m.HowToWriteLoveLetter }))),
  'MarriageProposalSpeech': lazy(() => import('./MarriageProposalSpeech').then(m => ({ default: m.MarriageProposalSpeech }))),
  'MarriageProposalIdeas': lazy(() => import('./MarriageProposalIdeas').then(m => ({ default: m.MarriageProposalIdeas }))),
  'LongDistanceRelationship': lazy(() => import('./LongDistanceRelationship').then(m => ({ default: m.LongDistanceRelationship }))),
  'LongDistanceBirthday': lazy(() => import('./LongDistanceBirthday').then(m => ({ default: m.LongDistanceBirthday }))),
  'HowToSayIMissYou': lazy(() => import('./HowToSayIMissYou').then(m => ({ default: m.HowToSayIMissYou }))),
  'MakeLovePageOnline': lazy(() => import('./MakeLovePageOnline').then(m => ({ default: m.MakeLovePageOnline }))),
  'SurprisePartnerWebsite': lazy(() => import('./SurprisePartnerWebsite').then(m => ({ default: m.SurprisePartnerWebsite }))),
  'GirlfriendDayWishes2026': lazy(() => import('./GirlfriendDayWishes2026').then(m => ({ default: m.GirlfriendDayWishes2026 }))),
  'GiftForGirlfriend': lazy(() => import('./GiftForGirlfriend').then(m => ({ default: m.GiftForGirlfriend }))),
  'SurpriseGirlfriendWebsite': lazy(() => import('./SurpriseGirlfriendWebsite').then(m => ({ default: m.SurpriseGirlfriendWebsite }))),
  'WebsiteForGirlfriend': lazy(() => import('./WebsiteForGirlfriend').then(m => ({ default: m.WebsiteForGirlfriend }))),
  'CuteWebsiteGirlfriend': lazy(() => import('./CuteWebsiteGirlfriend').then(m => ({ default: m.CuteWebsiteGirlfriend }))),
  'RomanticWebsiteGirlfriend': lazy(() => import('./RomanticWebsiteGirlfriend').then(m => ({ default: m.RomanticWebsiteGirlfriend }))),
  'NationalGirlfriendDay': lazy(() => import('./NationalGirlfriendDay').then(m => ({ default: m.NationalGirlfriendDay }))),
  'CouplesDay2026': lazy(() => import('./CouplesDay2026').then(m => ({ default: m.CouplesDay2026 }))),
  'CoupleDayGiftIdeas': lazy(() => import('./CoupleDayGiftIdeas').then(m => ({ default: m.CoupleDayGiftIdeas }))),
  'WhenIsCouplesDay': lazy(() => import('./WhenIsCouplesDay').then(m => ({ default: m.WhenIsCouplesDay }))),
  'FirstAnniversary': lazy(() => import('./FirstAnniversary').then(m => ({ default: m.FirstAnniversary }))),
  'Anniversary5Year': lazy(() => import('./Anniversary5Year').then(m => ({ default: m.Anniversary5Year }))),
  'Anniversary25Year': lazy(() => import('./Anniversary25Year').then(m => ({ default: m.Anniversary25Year }))),
  'HowToApologize': lazy(() => import('./HowToApologize').then(m => ({ default: m.HowToApologize }))),
  'ApologyLetterGirlfriend': lazy(() => import('./ApologyLetterGirlfriend').then(m => ({ default: m.ApologyLetterGirlfriend }))),
  'ApologyAfterFight': lazy(() => import('./ApologyAfterFight').then(m => ({ default: m.ApologyAfterFight }))),
  'MakePersonalizedWebsite': lazy(() => import('./MakePersonalizedWebsite').then(m => ({ default: m.MakePersonalizedWebsite }))),
  'CostOfCoupleWebsite': lazy(() => import('./CostOfCoupleWebsite').then(m => ({ default: m.CostOfCoupleWebsite }))),
  'BestRomanticWebsiteBuilders': lazy(() => import('./BestRomanticWebsiteBuilders').then(m => ({ default: m.BestRomanticWebsiteBuilders }))),
  'DigitalVsPhysicalGifting': lazy(() => import('./DigitalVsPhysicalGifting').then(m => ({ default: m.DigitalVsPhysicalGifting }))),
  'WhyYoungIndiansDigital': lazy(() => import('./WhyYoungIndiansDigital').then(m => ({ default: m.WhyYoungIndiansDigital }))),
  'EarnMoneySelling': lazy(() => import('./EarnMoneySelling').then(m => ({ default: m.EarnMoneySelling }))),
  'RakshaBandhan2026': lazy(() => import('./RakshaBandhan2026').then(m => ({ default: m.RakshaBandhan2026 }))),
  'Diwali2026': lazy(() => import('./Diwali2026').then(m => ({ default: m.Diwali2026 }))),
  'Holi2026': lazy(() => import('./Holi2026').then(m => ({ default: m.Holi2026 }))),
  'Eid2026': lazy(() => import('./Eid2026').then(m => ({ default: m.Eid2026 }))),
  'MothersDay2026': lazy(() => import('./MothersDay2026').then(m => ({ default: m.MothersDay2026 }))),
  'FathersDay2026': lazy(() => import('./FathersDay2026').then(m => ({ default: m.FathersDay2026 }))),
  'TeachersDay2026': lazy(() => import('./TeachersDay2026').then(m => ({ default: m.TeachersDay2026 }))),
};

export function BlogArticleRouter({ slug, onBack }: BlogArticleRouterProps) {
  // Find blog post metadata
  const post = BLOG_POSTS.find(p => p.slug === slug);
  
  if (!post) {
    return <BlogNotFound slug={slug} onBack={onBack} />;
  }

  // Get the correct lazy component
  const BlogComponent = blogComponents[post.component];

  if (!BlogComponent) {
    return <BlogNotFound slug={slug} onBack={onBack} />;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <div>
        {/* Back button overlay */}
        <div className="fixed top-16 left-4 z-30">
          <button
            onClick={onBack}
            className="bg-white border-2 border-black rounded-xl px-3 py-1.5 font-heading text-xs uppercase font-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-1.5"
          >
            ← Blog
          </button>
        </div>
        <BlogComponent />
      </div>
    </Suspense>
  );
}
