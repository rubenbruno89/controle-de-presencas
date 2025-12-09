# Controle de Presenças

> Uma ferramenta simples para registrar presença e ausência por “salas” ou “grupos”, com exportação para PDF — sem necessidade de banco de dados.

---

## 📝 Descrição

O **Controle de Presenças** é uma aplicação web estática que permite adicionar salas/grupos informando quantos estão presentes e quantos ausentes, exibir os totais e gerar um relatório em PDF. Ideal para turmas, reuniões, eventos ou grupos onde não há necessidade de controle nominal — apenas contagem quantitativa.

A aplicação é totalmente executada no navegador e está hospedada via GitHub Pages, sem backend.  

👉 Acesse a versão online: https://rubenbruno89.github.io/controle-de-presencas/

---

## ✅ Funcionalidades

- Adicionar nova sala/grupo com nome (ou número) + quantidade de presentes e ausentes.  
- Editar dados de salas existentes (nome, presentes, ausentes).  
- Exibir tabela com todas as salas: Sala, Presentes, Ausentes, Total por sala.  
- Mostrar totais agregados: Total de Presentes, Total de Ausentes, Total Geral.  
- Gerar relatório em PDF com todos os dados registrados.  
- Limpar todos os registros para reiniciar a contagem.  

---

## 🔧 Como funciona

- Os dados são armazenados localmente no navegador (localStorage ou similar) — não há servidor ou banco de dados remoto.  
- Por ser estático (HTML + CSS + JavaScript), basta abrir no navegador para usar.  
- Está hospedado via GitHub Pages, o que facilita o deploy e uso público. :contentReference[oaicite:1]{index=1}

---

## 🚀 Como usar / testar localmente

1. Clone este repositório:
   ```bash
   git clone https://github.com/<seu-usuario>/controle-de-presencas.git
