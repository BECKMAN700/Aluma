import { Image, StyleSheet, Text, View } from 'react-native';

// estrelas
const GALAXY_STARS = [
  { top: '2%', left: '12%', size: 1.2, opacity: 0.45, color: '#E0F2FE' },
  { top: '3%', left: '38%', size: 2.0, opacity: 0.8, color: '#FFFFFF' },
  { top: '4%', left: '68%', size: 1.0, opacity: 0.4, color: '#BAE6FD' },
  { top: '5%', left: '88%', size: 2.5, opacity: 0.9, color: '#FEF08A' },
  { top: '6%', left: '22%', size: 1.5, opacity: 0.6, color: '#FFFFFF' },
  { top: '7%', left: '52%', size: 0.8, opacity: 0.35, color: '#E0E7FF' },
  { top: '8%', left: '82%', size: 2.2, opacity: 0.85, color: '#BAE6FD' },
  { top: '9%', left: '6%', size: 1.8, opacity: 0.7, color: '#FED7AA' },
  { top: '10%', left: '32%', size: 1.0, opacity: 0.4, color: '#FFFFFF' },
  { top: '11%', left: '94%', size: 1.4, opacity: 0.55, color: '#BAE6FD' },
  { top: '12%', left: '46%', size: 2.6, opacity: 0.95, color: '#FFFFFF' },
  { top: '13%', left: '74%', size: 1.2, opacity: 0.5, color: '#E0E7FF' },
  { top: '14%', left: '18%', size: 1.0, opacity: 0.35, color: '#FFFFFF' },
  { top: '15%', left: '60%', size: 2.0, opacity: 0.75, color: '#FEF08A' },
  { top: '16%', left: '86%', size: 1.6, opacity: 0.65, color: '#BAE6FD' },
  { top: '17%', left: '10%', size: 2.8, opacity: 0.9, color: '#FFFFFF' },
  { top: '18%', left: '40%', size: 0.8, opacity: 0.3, color: '#E0E7FF' },
  { top: '19%', left: '70%', size: 1.5, opacity: 0.6, color: '#FFFFFF' },
  { top: '20%', left: '96%', size: 2.2, opacity: 0.85, color: '#FED7AA' },
  { top: '21%', left: '26%', size: 1.2, opacity: 0.45, color: '#BAE6FD' },
  { top: '22%', left: '54%', size: 2.0, opacity: 0.8, color: '#FFFFFF' },
  { top: '23%', left: '80%', size: 1.0, opacity: 0.35, color: '#E0E7FF' },
  { top: '24%', left: '14%', size: 1.8, opacity: 0.7, color: '#FEF08A' },
  { top: '25%', left: '44%', size: 1.4, opacity: 0.55, color: '#FFFFFF' },
  { top: '26%', left: '90%', size: 2.5, opacity: 0.95, color: '#BAE6FD' },
  { top: '27%', left: '6%', size: 1.0, opacity: 0.4, color: '#FFFFFF' },
  { top: '28%', left: '64%', size: 2.2, opacity: 0.85, color: '#E0E7FF' },
  { top: '29%', left: '36%', size: 0.8, opacity: 0.3, color: '#FED7AA' },
  { top: '30%', left: '76%', size: 1.6, opacity: 0.65, color: '#FFFFFF' },
  { top: '31%', left: '18%', size: 2.4, opacity: 0.9, color: '#BAE6FD' },
  { top: '32%', left: '96%', size: 1.2, opacity: 0.45, color: '#FFFFFF' },
  { top: '33%', left: '50%', size: 1.0, opacity: 0.35, color: '#FEF08A' },
  { top: '34%', left: '84%', size: 2.0, opacity: 0.75, color: '#E0E7FF' },
  { top: '35%', left: '12%', size: 1.5, opacity: 0.6, color: '#FFFFFF' },
  { top: '36%', left: '62%', size: 2.6, opacity: 0.9, color: '#BAE6FD' },
  { top: '37%', left: '28%', size: 1.0, opacity: 0.4, color: '#FED7AA' },
  { top: '38%', left: '92%', size: 1.8, opacity: 0.7, color: '#FFFFFF' },
  { top: '39%', left: '42%', size: 0.8, opacity: 0.3, color: '#E0E7FF' },
  { top: '40%', left: '72%', size: 2.2, opacity: 0.85, color: '#FEF08A' },
  { top: '41%', left: '4%', size: 1.4, opacity: 0.55, color: '#BAE6FD' },
  { top: '42%', left: '56%', size: 2.0, opacity: 0.8, color: '#FFFFFF' },
  { top: '43%', left: '88%', size: 1.2, opacity: 0.45, color: '#E0E7FF' },
  { top: '44%', left: '22%', size: 2.5, opacity: 0.95, color: '#FFFFFF' },
  { top: '45%', left: '78%', size: 1.0, opacity: 0.35, color: '#FED7AA' },
  { top: '46%', left: '34%', size: 1.6, opacity: 0.65, color: '#BAE6FD' },
  { top: '47%', left: '94%', size: 2.0, opacity: 0.75, color: '#FFFFFF' },
  { top: '48%', left: '16%', size: 1.0, opacity: 0.4, color: '#FEF08A' },
  { top: '49%', left: '66%', size: 2.4, opacity: 0.9, color: '#E0E7FF' },
  { top: '50%', left: '48%', size: 0.8, opacity: 0.3, color: '#FFFFFF' },
  { top: '51%', left: '82%', size: 1.8, opacity: 0.7, color: '#BAE6FD' },
  { top: '52%', left: '8%', size: 2.2, opacity: 0.85, color: '#FFFFFF' },
  { top: '53%', left: '58%', size: 1.2, opacity: 0.45, color: '#FED7AA' },
  { top: '54%', left: '90%', size: 2.6, opacity: 0.95, color: '#FEF08A' },
  { top: '55%', left: '30%', size: 1.4, opacity: 0.55, color: '#E0E7FF' },
  { top: '56%', left: '74%', size: 1.0, opacity: 0.35, color: '#FFFFFF' },
  { top: '57%', left: '14%', size: 2.0, opacity: 0.8, color: '#BAE6FD' },
  { top: '58%', left: '44%', size: 1.5, opacity: 0.6, color: '#FFFFFF' },
  { top: '59%', left: '86%', size: 2.2, opacity: 0.85, color: '#FED7AA' },
  { top: '60%', left: '2%', size: 1.0, opacity: 0.4, color: '#E0E7FF' },
  { top: '61%', left: '68%', size: 2.5, opacity: 0.9, color: '#FFFFFF' },
  { top: '62%', left: '24%', size: 0.8, opacity: 0.3, color: '#FEF08A' },
  { top: '63%', left: '96%', size: 1.8, opacity: 0.7, color: '#BAE6FD' },
  { top: '64%', left: '52%', size: 1.2, opacity: 0.45, color: '#FFFFFF' },
  { top: '65%', left: '80%', size: 2.0, opacity: 0.75, color: '#E0E7FF' },
  { top: '66%', left: '18%', size: 2.8, opacity: 0.95, color: '#FFFFFF' },
  { top: '67%', left: '60%', size: 1.0, opacity: 0.35, color: '#FED7AA' },
  { top: '68%', left: '92%', size: 1.6, opacity: 0.65, color: '#BAE6FD' },
  { top: '69%', left: '36%', size: 2.2, opacity: 0.85, color: '#FEF08A' },
  { top: '70%', left: '76%', size: 1.4, opacity: 0.55, color: '#FFFFFF' },
  { top: '71%', left: '10%', size: 1.0, opacity: 0.4, color: '#E0E7FF' },
  { top: '72%', left: '48%', size: 2.4, opacity: 0.9, color: '#BAE6FD' },
  { top: '73%', left: '84%', size: 0.8, opacity: 0.3, color: '#FFFFFF' },
  { top: '74%', left: '28%', size: 1.8, opacity: 0.7, color: '#FED7AA' },
  { top: '75%', left: '64%', size: 2.0, opacity: 0.8, color: '#FFFFFF' },
  { top: '76%', left: '94%', size: 1.2, opacity: 0.45, color: '#FEF08A' },
  { top: '77%', left: '6%', size: 2.6, opacity: 0.95, color: '#BAE6FD' },
  { top: '78%', left: '40%', size: 1.0, opacity: 0.35, color: '#E0E7FF' },
  { top: '79%', left: '72%', size: 1.6, opacity: 0.65, color: '#FFFFFF' },
  { top: '80%', left: '20%', size: 2.2, opacity: 0.85, color: '#FED7AA' },
  { top: '81%', left: '88%', size: 1.4, opacity: 0.55, color: '#BAE6FD' },
  { top: '82%', left: '54%', size: 2.0, opacity: 0.75, color: '#FFFFFF' },
  { top: '83%', left: '14%', size: 0.8, opacity: 0.3, color: '#E0E7FF' },
  { top: '84%', left: '78%', size: 2.5, opacity: 0.9, color: '#FEF08A' },
  { top: '85%', left: '32%', size: 1.2, opacity: 0.45, color: '#FFFFFF' },
  { top: '86%', left: '96%', size: 1.8, opacity: 0.7, color: '#BAE6FD' },
  { top: '87%', left: '66%', size: 1.0, opacity: 0.4, color: '#FED7AA' },
  { top: '88%', left: '22%', size: 2.8, opacity: 0.95, color: '#FFFFFF' },
  { top: '89%', left: '50%', size: 1.6, opacity: 0.6, color: '#E0E7FF' },
  { top: '90%', left: '82%', size: 2.0, opacity: 0.8, color: '#BAE6FD' },
  { top: '91%', left: '8%', size: 1.0, opacity: 0.35, color: '#FFFFFF' },
  { top: '92%', left: '60%', size: 2.2, opacity: 0.85, color: '#FEF08A' },
  { top: '93%', left: '38%', size: 1.4, opacity: 0.55, color: '#FED7AA' },
  { top: '94%', left: '90%', size: 2.4, opacity: 0.9, color: '#BAE6FD' },
  { top: '95%', left: '16%', size: 0.8, opacity: 0.3, color: '#FFFFFF' },
  { top: '96%', left: '74%', size: 1.8, opacity: 0.7, color: '#E0E7FF' },
  { top: '97%', left: '46%', size: 2.0, opacity: 0.75, color: '#FFFFFF' },
  { top: '98%', left: '86%', size: 1.2, opacity: 0.45, color: '#FEF08A' },
];

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
              top: star.top as any,
              left: star.left as any,
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
            <Text style={styles.pillarIndex}>[ 01 ]</Text>
            <Text style={styles.pillarTitle}>Método Socrático</Text>
            <Text style={styles.pillarSub}>Aprenda por questionamento</Text>
          </View>

          <View style={styles.pillarItem}>
            <Text style={styles.pillarIndex}>[ 02 ]</Text>
            <Text style={styles.pillarTitle}>Sem Respostas Prontas</Text>
            <Text style={styles.pillarSub}>Foco no aprendizado independente</Text>
          </View>

          <View style={styles.pillarItem}>
            <Text style={styles.pillarIndex}>[ 03 ]</Text>
            <Text style={styles.pillarTitle}>Pensamento Crítico</Text>
            <Text style={styles.pillarSub}>Desenvolva a lógica pura</Text>
          </View>
        </View>
      </View>

      {/* rodape */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          • ALUMA • SISTEMA EDUCACIONAL •
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000208',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 28,
    position: 'relative',
    overflow: 'hidden',
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
  pillarIndex: {
    fontSize: 9,
    fontWeight: '800',
    color: '#38BDF8',
    fontFamily: 'monospace',
    letterSpacing: 1,
    marginBottom: 2,
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