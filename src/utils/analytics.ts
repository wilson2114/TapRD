import { ProfileAnalytics } from '../types';

const STORAGE_KEY = 'taprd_analytics_store';

export type InteractionType = 
  | 'tap' 
  | 'whatsapp' 
  | 'instagram' 
  | 'vcard' 
  | 'review' 
  | 'directions'
  | 'call'
  | 'website';

export interface RecordedEvent {
  timestamp: number;
  profileSlug: string;
  type: InteractionType;
}

export function recordInteraction(profileSlug: string, type: InteractionType) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const events: RecordedEvent[] = raw ? JSON.parse(raw) : [];
    events.push({
      timestamp: Date.now(),
      profileSlug,
      type
    });
    // Keep max 200 events in demo storage
    if (events.length > 200) {
      events.shift();
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch {
    // Local storage non-critical fallback
  }
}

export function getProfileLocalStats(profileSlug: string, baseStats?: ProfileAnalytics): ProfileAnalytics {
  const fallback: ProfileAnalytics = baseStats || {
    totalTaps: 120,
    whatsappClicks: 45,
    instagramClicks: 30,
    vcardDownloads: 18,
    reviewClicks: 12,
    directionsClicks: 15,
    weeklyTaps: [
      { day: 'Lun', taps: 14 },
      { day: 'Mar', taps: 22 },
      { day: 'Mié', taps: 18 },
      { day: 'Jue', taps: 25 },
      { day: 'Vie', taps: 38 },
      { day: 'Sáb', taps: 44 },
      { day: 'Dom', taps: 12 }
    ]
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const events: RecordedEvent[] = JSON.parse(raw);
    const profileEvents = events.filter(e => e.profileSlug === profileSlug);

    const localWhatsapp = profileEvents.filter(e => e.type === 'whatsapp').length;
    const localInstagram = profileEvents.filter(e => e.type === 'instagram').length;
    const localVcard = profileEvents.filter(e => e.type === 'vcard').length;
    const localReview = profileEvents.filter(e => e.type === 'review').length;
    const localDirections = profileEvents.filter(e => e.type === 'directions').length;
    const localTaps = profileEvents.filter(e => e.type === 'tap').length;

    return {
      totalTaps: fallback.totalTaps + localTaps,
      whatsappClicks: fallback.whatsappClicks + localWhatsapp,
      instagramClicks: fallback.instagramClicks + localInstagram,
      vcardDownloads: fallback.vcardDownloads + localVcard,
      reviewClicks: fallback.reviewClicks + localReview,
      directionsClicks: fallback.directionsClicks + localDirections,
      weeklyTaps: fallback.weeklyTaps
    };
  } catch {
    return fallback;
  }
}
