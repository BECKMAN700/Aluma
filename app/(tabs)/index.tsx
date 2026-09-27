import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Colors } from '@/constants/theme';

// estrelas -- amostra de ~20 do céu original (98 pontos era peso demais para celular fraco)
const GALAXY_STARS = [
  { top: '2%', left: '12%', size: 1.2, opacity: 0.45, color: '#E0F2FE' },
  { top: '7%', left: '52%', size: 0.8, opacity: 0.35, color: '#E0E7FF' },
  { top: '12%', left: '46%', size: 2.6, opacity: 0.95, color: '#FFFFFF' },
  { top: '17%', left: '10%', size: 2.8, opacity: 0.9, color: '#FFFFFF' },
  { top: '22%', left: '54%', size: 2.0, opacity: 0.8, color: '#FFFFFF' },
  { top: '27%', left: '6%', size: 1.0, opacity: 0.4, color: '#FFFFFF' },
  { top: '32%', left: '96%', size: 1.2, opacity: 0.45, color: '#FFFFFF' },
  { top: '37%', left: '28%', size: 1.0, opacity: 0.4, color: '#FED7AA' },
  { top: '42%', left: '56%', size: 2.0, opacity: 0.8, color: '#FFFFFF' },
  { top: '47%', left: '94%', size: 2.0, opacity: 0.75, color: '#FFFFFF' },
  { top: '52%', left: '8%', size: 2.2, opacity: 0.85, color: '#FFFFFF' },
  { top: '57%', left: '14%', size: 2.0, opacity: 0.8, color: '#BAE6FD' },
  { top: '62%', left: '24%', size: 0.8, opacity: 0.3, color: '#FEF08A' },
  { top: '67%', left: '60%', size: 1.0, opacity: 0.35, color: '#FED7AA' },
  { top: '72%', left: '48%', size: 2.4, opacity: 0.9, color: '#BAE6FD' },
  { top: '77%', left: '6%', size: 2.6, opacity: 0.95, color: '#BAE6FD' },
  { top: '82%', left: '54%', size: 2.0, opacity: 0.75, color: '#FFFFFF' },
  { top: '87%', left: '66%', size: 1.0, opacity: 0.4, color: '#FED7AA' },
  { top: '92%', left: '60%', size: 2.2, opacity: 0.85, color: '#FEF08A' },
  { top: '97%', left: '46%', size: 2.0, opacity: 0.75, color: '#FFFFFF' },
] as const;

export default function HomeScreen() {
  return (
    <View style={styles.screen}>
      {/* circulos */}
      <View style={styles.glowOrbTop} />
      <View style={styles.glowOrbCenter} />
      <View style={styles.glowOrbBottom} />

      {/* luz  background*/}
      <View style={styles.milkyWayStream} />

      {/* estrelas */}
      {GALAXY_STARS.map((star, index) => (
        <View
          key={index}
          style={[
            styles.starDot,
            {
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              borderRadius: star.size / 2,
              backgroundColor: star.color,
              opacity: star.opacity,
            },
          ]}
        />
      ))}

      {/* estrelas */}
      <View style={[styles.sparkleContainer, { top: '8%', left: '82%' }]}>
        <Text style={styles.sparkleGlyph}>✦</Text>
      </View>
      <View style={[styles.sparkleContainer, { top: '24%', left: '10%' }]}>
        <Text style={styles.sparkleGlyphSmall}>✧</Text>
      </View>
      <View style={[styles.sparkleContainer, { top: '64%', left: '88%' }]}>
        <Text style={styles.sparkleGlyph}>✦</Text>
      </View>
      <View style={[styles.sparkleContainer, { top: '86%', left: '20%' }]}>
        <Text style={styles.sparkleGlyphSmall}>✧</Text>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>• ALUNO • LUZ •</Text>
          </View>

          {/* logo */}
          <View style={styles.avatarGlowContainer}>
            <Image
              source={require('../../assets/images/aluma_logo.jpg')}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          </View>

          {/* título e subtítulo */}
          <Text style={styles.title}>
            ALUMA<Text style={styles.titleAccent}> IA</Text>
          </Text>

          <Text style={styles.subtitle}>
            O orientador com inteligência artificial que guia seu aprendizado por meio de perguntas. Você constrói o raciocínio e chega às suas próprias conclusões.
          </Text>

          {/* cards da plataforma */}
          <View style={styles.pillarsContainer}>
            <View style={styles.pillarItem}>
              <Text style={styles.pillarTitle}>Método Socrático</Text>
              <Text style={styles.pillarSub}>Aprenda por questionamento</Text>
            </View>

            <View style={styles.pillarItem}>
              <Text style={styles.pillarTitle}>Sem Respostas Prontas</Text>
              <Text style={styles.pillarSub}>Foco no aprendizado independente</Text>
            </View>

            <View style={styles.pillarItem}>
              <Text style={styles.pillarTitle}>Pensamento Crítico</Text>
              <Text style={styles.pillarSub}>Desenvolva a lógica pura</Text>
            </View>
          </View>

          {/* Botão para navegar até o Chat - Issue A */}
          <Link href="/chat" asChild>
            <Pressable
              style={styles.chatButton}
              accessibilityRole="button"
              accessibilityLabel="Conversar com o tutor"
            >
              <Text style={styles.chatButtonText}>Conversar com o tutor</Text>
            </Pressable>
          </Link>
        </View>

        {/* rodape */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            • ALUMA • SISTEMA EDUCACIONAL •
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000208',
    paddingHorizontal: 20,
    paddingTop: 48,
    position: 'relative',
    overflow: 'hidden',
  },
  scrollArea: {
    flex: 1,
    width: '100%',
    zIndex: 2,
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 24,
    minHeight: '100%',
    justifyContent: 'space-between',
  },

  /* circulos */
  glowOrbTop: {
    position: 'absolute',
    top: -140,
    right: -80,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
  },
  glowOrbCenter: {
    position: 'absolute',
    top: '32%',
    left: -130,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
  },
  glowOrbBottom: {
    position: 'absolute',
    bottom: -130,
    alignSelf: 'center',
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: 'rgba(6, 182, 212, 0.14)',
  },

  /* luz background */
  milkyWayStream: {
    position: 'absolute',
    top: '-40%',
    left: '-30%',
    width: '180%',
    height: '180%',
    backgroundColor: 'rgba(56, 189, 248, 0.025)',
    transform: [{ rotate: '-38deg' }],
  },

  /* pontos estelares */
  starDot: {
    position: 'absolute',
  },

  /* estrelas */
  sparkleContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkleGlyph: {
    fontSize: 14,
    color: '#BAE6FD',
    opacity: 0.9,
    textShadowColor: '#38BDF8',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  sparkleGlyphSmall: {
    fontSize: 11,
    color: '#E0E7FF',
    opacity: 0.8,
    textShadowColor: '#818CF8',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },

  /* container */
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 420,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 10, 22, 0.9)',
    borderColor: 'rgba(56, 189, 248, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 1.5,
    fontFamily: 'monospace',
  },
  avatarGlowContainer: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 2,
    borderColor: '#38BDF8',
    backgroundColor: '#050A16',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.75,
    shadowRadius: 18,
    elevation: 8,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 52,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(56, 189, 248, 0.45)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  titleAccent: {
    color: '#38BDF8',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: '#CBD5E1',
    textAlign: 'center',
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  pillarsContainer: {
    width: '100%',
    gap: 10,
  },
  pillarItem: {
    backgroundColor: 'rgba(5, 10, 22, 0.9)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 3,
  },
  pillarTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F1F5F9',
    marginBottom: 2,
  },
  pillarSub: {
    fontSize: 11,
    color: '#94A3B8',
  },
  chatButton: {
    marginTop: 18,
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: Colors.light.tint,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.light.tint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  chatButtonText: {
    color: '#000208',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(56, 189, 248, 0.12)',
    width: '100%',
    justifyContent: 'center',
    zIndex: 2,
  },
  footerText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1.2,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
});