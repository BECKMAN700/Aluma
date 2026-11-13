/**
 * Botão "Enviar PDF" de um tópico: abre o seletor, envia e mostra o erro do servidor
 * (grande demais, escaneado, não é PDF) do jeito que ele vier.
 */
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

import { FontesHorizonte, Horizonte } from '@/constants/theme';
import { sair } from '@/services/auth';
import { enviarMaterial } from '@/services/materias';

export function EnviarPdf({
  topicoId,
  nomeTopico,
  temMaterial,
  aoEnviar,
}: {
  topicoId: string;
  nomeTopico: string;
  temMaterial: boolean;
  aoEnviar: () => void;
}) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const escolherEEnviar = async () => {
    if (enviando) return;
    setErro(null);
    const escolha = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true });
    if (escolha.canceled) return;
    const arquivo = escolha.assets[0];
    setEnviando(true);
    try {
      const r = await enviarMaterial(topicoId, arquivo.uri, arquivo.name);
      if (r.ok) aoEnviar();
      else if (r.status === 401) await sair();
      else setErro(r.erro);
    } finally {
      setEnviando(false);
    }
  };

  const texto = enviando ? 'Enviando…' : temMaterial ? 'Trocar PDF' : 'Enviar PDF';
  return (
    <View style={styles.coluna}>
      <Pressable
        style={({ pressed }) => [styles.botao, (pressed || enviando) && styles.apagado]}
        onPress={escolherEEnviar}
        disabled={enviando}
        accessibilityRole="button"
        accessibilityLabel={`${texto} do tópico ${nomeTopico}`}
        accessibilityState={{ disabled: enviando, busy: enviando }}
      >
        <Text style={styles.botaoTexto}>{texto}</Text>
      </Pressable>
      {!!erro && (
        <Text style={styles.erro} accessibilityRole="alert" accessibilityLiveRegion="polite">
          {erro}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  coluna: { alignItems: 'flex-start', gap: 4 },
  apagado: { opacity: 0.6 },
  botao: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: Horizonte.text,
    borderRadius: 22,
    backgroundColor: Horizonte.surface,
  },
  botaoTexto: { fontFamily: FontesHorizonte.displayMedio, fontSize: 14, lineHeight: 20, color: Horizonte.text },
  erro: { fontFamily: FontesHorizonte.corpo, fontSize: 13, lineHeight: 18, color: Horizonte.error },
});
