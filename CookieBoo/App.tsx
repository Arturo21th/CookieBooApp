import React from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

type Palette = {
  background: string;
  cardPrimary: string;
  cardSecondary: string;
  accent: string;
  accentMuted: string;
  textPrimary: string;
  textMuted: string;
  border: string;
  highlight: string;
  shadow: string;
};

const lightPalette: Palette = {
  background: '#FFFDF8',
  cardPrimary: '#F6EDE3',
  cardSecondary: '#FFFFFF',
  accent: '#FF9B6A',
  accentMuted: '#FFE1D1',
  textPrimary: '#1C150F',
  textMuted: '#6A5D52',
  border: '#F0E6DC',
  highlight: '#FDEEE3',
  shadow: 'rgba(28, 21, 15, 0.15)',
};

const darkPalette: Palette = {
  background: '#090606',
  cardPrimary: '#1F1410',
  cardSecondary: '#130C0A',
  accent: '#FFAE7A',
  accentMuted: '#3B1E13',
  textPrimary: '#F9F3ED',
  textMuted: '#B7ADA4',
  border: '#2E211D',
  highlight: '#2A1A14',
  shadow: '#000000',
};

const featuredCookies = [
  {
    id: 'midnight',
    icon: '🌙',
    name: 'Midnight Sea Salt',
    tagline: '72% cacao, maldon crunch',
    rating: '4.9',
    badge: 'Chef favorite',
    detail: 'Fermented dough • 18h rest',
  },
  {
    id: 'cereal',
    icon: '🥣',
    name: 'Cereal Milk Crunch',
    tagline: 'Toasted cornflake praline',
    rating: '4.7',
    badge: 'Limited drop',
    detail: 'Sweet-salty glaze • Hand-piped',
  },
  {
    id: 'rose',
    icon: '🌸',
    name: 'Rose Pistachio Bloom',
    tagline: 'Vegan tahini butter',
    rating: '5.0',
    badge: 'Plant-based',
    detail: 'Cardamom sugar • Gold dust',
  },
];

const kitchenEvents = [
  {
    id: 'proof',
    time: '08:00',
    title: 'Dough cold-proof',
    detail: 'Starter activated overnight with brown butter.',
  },
  {
    id: 'bake',
    time: '11:15',
    title: 'First bake window',
    detail: 'Stone deck set to 320ºC for caramel edges.',
  },
  {
    id: 'drop',
    time: '15:30',
    title: 'Neighborhood drop',
    detail: 'Courier bikes deliver in insulated cookie totes.',
  },
];

const memberships = [
  {
    id: 'glow',
    title: 'Glow Box',
    detail: '6 seasonal flavors curated by CookieBoo chefs.',
    shipping: 'Friday pickups + cold ship to 20 cities.',
  },
  {
    id: 'midnight',
    title: 'Midnight Pantry',
    detail: 'Emergency cookie stash with reheat instructions.',
    shipping: 'Delivered monthly in reusable tins.',
  },
];

const kitchenStats = [
  { id: 'batches', value: '24', label: 'Small batches', detail: 'Mixed this morning' },
  { id: 'orders', value: '420+', label: 'Community orders', detail: 'This week' },
  { id: 'score', value: '4.9★', label: 'Tasting score', detail: 'Based on 320 reviews' },
];

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const palette = isDarkMode ? darkPalette : lightPalette;

  return (
    <SafeAreaProvider>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={styles.scrollContent}
        >
          <HeroSection palette={palette} />
          <StatsSection palette={palette} />
          <FeaturedCookiesSection palette={palette} />
          <KitchenTimelineSection palette={palette} />
          <MembershipSection palette={palette} />
          <CTASection palette={palette} />
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

type PaletteProps = { palette: Palette };

function HeroSection({ palette }: PaletteProps) {
  return (
    <View style={[styles.heroCard, { backgroundColor: palette.cardPrimary, shadowColor: palette.shadow }]}>
      <Text style={[styles.taglineOverline, { color: palette.textMuted }]}>COOKIEBOO</Text>
      <Text style={[styles.heroTitle, { color: palette.textPrimary }]}>
        Galletas artesanales para cada antojo del día.
      </Text>
      <Text style={[styles.heroSubtitle, { color: palette.textMuted }]}>
        Planifica tus drops, recoge en el atelier o agenda delivery frío a tu ciudad.
      </Text>
      <View style={styles.heroTags}>
        {['Same-day pickup', 'Ingredientes locales', 'Latte pairings'].map(tag => (
          <View
            key={tag}
            style={[styles.tagPill, { backgroundColor: palette.accentMuted, borderColor: palette.border }]}
          >
            <Text style={[styles.tagPillText, { color: palette.textPrimary }]}>{tag}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function StatsSection({ palette }: PaletteProps) {
  return (
    <View style={styles.section}>
      <SectionHeader
        palette={palette}
        title="Pulso del obrador"
        subtitle="Actualizado en tiempo real por la brigada CookieBoo."
      />
      <View style={styles.statGrid}>
        {kitchenStats.map(stat => (
          <View
            key={stat.id}
            style={[
              styles.statCard,
              { backgroundColor: palette.cardSecondary, borderColor: palette.border, shadowColor: palette.shadow },
            ]}
          >
            <Text style={[styles.statValue, { color: palette.textPrimary }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: palette.textMuted }]}>{stat.label}</Text>
            <Text style={[styles.statDetail, { color: palette.textPrimary }]}>{stat.detail}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function FeaturedCookiesSection({ palette }: PaletteProps) {
  return (
    <View style={styles.section}>
      <SectionHeader
        palette={palette}
        title="Sabores en vitrina"
        subtitle="Drops calientitos listos para pedir."
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cookieCarousel}
      >
        {featuredCookies.map(cookie => (
          <View
            key={cookie.id}
            style={[styles.cookieCard, { backgroundColor: palette.cardSecondary, borderColor: palette.border }]}
          >
            <View style={[styles.cookieBadge, { backgroundColor: palette.highlight }]}>
              <Text style={styles.cookieBadgeText}>{cookie.badge}</Text>
            </View>
            <Text style={styles.cookieIcon}>{cookie.icon}</Text>
            <Text style={[styles.cookieName, { color: palette.textPrimary }]}>{cookie.name}</Text>
            <Text style={[styles.cookieTagline, { color: palette.textMuted }]}>{cookie.tagline}</Text>
            <View style={styles.cookieFoot}>
              <Text style={[styles.cookieDetail, { color: palette.textPrimary }]}>{cookie.detail}</Text>
              <Text style={[styles.cookieRating, { color: palette.accent }]}>{cookie.rating}★</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function KitchenTimelineSection({ palette }: PaletteProps) {
  return (
    <View style={styles.section}>
      <SectionHeader
        palette={palette}
        title="Agenda del día"
        subtitle="Así se hornea la magia CookieBoo."
      />
      <View style={styles.timeline}>
        {kitchenEvents.map(event => (
          <View
            key={event.id}
            style={[styles.timelineItem, { borderColor: palette.border, backgroundColor: palette.cardSecondary }]}
          >
            <View style={[styles.timelineDot, { backgroundColor: palette.accent }]} />
            <View style={styles.timelineCopy}>
              <Text style={[styles.timelineTime, { color: palette.accent }]}>{event.time}</Text>
              <Text style={[styles.timelineTitle, { color: palette.textPrimary }]}>{event.title}</Text>
              <Text style={[styles.timelineDetail, { color: palette.textMuted }]}>{event.detail}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function MembershipSection({ palette }: PaletteProps) {
  return (
    <View style={styles.section}>
      <SectionHeader
        palette={palette}
        title="Club CookieBoo"
        subtitle="Experiencias de suscripción pensadas para cookie lovers."
      />
      {memberships.map(plan => (
        <View
          key={plan.id}
          style={[styles.membershipCard, { backgroundColor: palette.cardSecondary, borderColor: palette.border }]}
        >
          <Text style={[styles.membershipTitle, { color: palette.textPrimary }]}>{plan.title}</Text>
          <Text style={[styles.membershipDetail, { color: palette.textMuted }]}>{plan.detail}</Text>
          <Text style={[styles.membershipShipping, { color: palette.textPrimary }]}>{plan.shipping}</Text>
        </View>
      ))}
    </View>
  );
}

function CTASection({ palette }: PaletteProps) {
  return (
    <TouchableOpacity activeOpacity={0.88} style={[styles.ctaButton, { backgroundColor: palette.accent }]}>
      <Text style={styles.ctaText}>Programa tu CookieBoo Drop</Text>
      <Text style={styles.ctaSubText}>Elige sabores, agenda horarios y comparte el enlace con tu comunidad.</Text>
    </TouchableOpacity>
  );
}

type SectionHeaderProps = {
  palette: Palette;
  title: string;
  subtitle?: string;
};

function SectionHeader({ palette, title, subtitle }: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>{title}</Text>
      {subtitle ? <Text style={[styles.sectionSubtitle, { color: palette.textMuted }]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    gap: 24,
  },
  section: {
    gap: 16,
  },
  heroCard: {
    padding: 24,
    borderRadius: 28,
    gap: 12,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 4,
  },
  taglineOverline: {
    fontSize: 13,
    letterSpacing: 2,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 36,
  },
  heroSubtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  heroTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tagPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  tagPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sectionHeader: {
    gap: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 15,
  },
  statGrid: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  statCard: {
    flexBasis: '30%',
    flexGrow: 1,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    marginTop: 6,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statDetail: {
    marginTop: 4,
    fontSize: 14,
  },
  cookieCarousel: {
    paddingVertical: 6,
    gap: 12,
  },
  cookieCard: {
    width: 240,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    gap: 10,
  },
  cookieBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  cookieBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  cookieIcon: {
    fontSize: 42,
  },
  cookieName: {
    fontSize: 20,
    fontWeight: '700',
  },
  cookieTagline: {
    fontSize: 15,
  },
  cookieFoot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 12,
  },
  cookieDetail: {
    flex: 1,
    fontSize: 13,
    marginRight: 12,
  },
  cookieRating: {
    fontSize: 16,
    fontWeight: '700',
  },
  timeline: {
    gap: 12,
  },
  timelineItem: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 6,
  },
  timelineCopy: {
    flex: 1,
    gap: 4,
  },
  timelineTime: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  timelineDetail: {
    fontSize: 14,
    lineHeight: 20,
  },
  membershipCard: {
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    marginBottom: 12,
  },
  membershipTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  membershipDetail: {
    fontSize: 15,
    marginTop: 6,
  },
  membershipShipping: {
    fontSize: 13,
    marginTop: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  ctaButton: {
    borderRadius: 26,
    padding: 24,
    gap: 6,
  },
  ctaText: {
    color: '#1B0D05',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  ctaSubText: {
    color: '#1B0D05',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default App;
