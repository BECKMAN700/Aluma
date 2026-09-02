import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Aluma</Text>
        <Text style={styles.tagline}>Aluno + Luz</Text>
        <Text style={styles.subtitle}>
          O tutor com inteligência artificial que guia seu aprendizado por meio de perguntas, ajudando você a encontrar o caminho e chegar às suas próprias conclusões — sem respostas prontas.
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Aprenda no seu ritmo • Desenvolva o pensamento crítico
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 480,
    width: '100%',
  },
  title: {
    fontSize: 42,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: '#475569',
    textAlign: 'center',
  },
  footer: {
    paddingVertical: 12,
  },
  footerText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
});