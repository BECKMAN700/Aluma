/**
 * Aluno logado que ainda não é de nenhuma turma (rota /sem-escola). O código de turma saiu em
 * 15/11: quem entra é pelo link de convite da escola. Se a conta acabou de ser criada a partir de
 * um convite, volta direto para ele.
 */
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { EstrelaNoHorizonte, Surgir } from '@/components/horizonte/ceu';
import { AvisoCarregando, CabecalhoMarca, LinkTexto, TelaFormulario, TituloTela } from '@/components/horizonte/formulario';
import { useSessao } from '@/hooks/use-sessao';
import { sair } from '@/services/auth';
import { convitePendente } from '@/services/convites';

export default function SemEscolaScreen() {
  const { sessao } = useSessao();
  const nome = sessao.estado === 'pronto' ? sessao.usuario.nome : '';
  const [procurando, setProcurando] = useState(true);

  useEffect(() => {
    convitePendente().then((convite) => {
      if (convite) router.replace({ pathname: '/convite/[convite]', params: { convite } });
      else setProcurando(false);
    });
  }, []);

  return (
    <TelaFormulario comCeu>
      <Surgir style={styles.camada}>
        <CabecalhoMarca />
      </Surgir>
      {procurando ? (
        <AvisoCarregando texto="Procurando o seu convite…" />
      ) : (
        <>
          <TituloTela
            titulo={nome ? `Olá, ${nome}!` : 'Olá!'}
            subtitulo="Para entrar na sua turma, abra o link de convite que a sua escola mandou."
            style={styles.textos}
          />
          <View style={styles.estrela}>
            <EstrelaNoHorizonte tamanho={36} />
          </View>
          <Surgir style={styles.camada}>
            <LinkTexto texto="Sair" rotulo="Sair da conta" aoTocar={sair} />
          </Surgir>
        </>
      )}
    </TelaFormulario>
  );
}

const styles = StyleSheet.create({
  camada: { zIndex: 1 },
  textos: { marginTop: 16, gap: 6 },
  estrela: { marginTop: 41, marginBottom: 28 },
});
