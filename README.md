<h1 align="center"><b>SKILLKIDS</b></h1>

### 🎯 **OBJETIVO**

> **Skill Kids** é uma aplicação web composta por uma **API RESTful**, desenvolvida em **Java** com **Spring Boot**, e uma interface de usuário construída utilizando **HTML, CSS e JavaScript**.

> O projeto tem como objetivo oferecer uma plataforma interativa voltada ao ensino de **lógica de programação para crianças**, permitindo o aprendizado de conceitos fundamentais de tecnologia por meio de conteúdos educativos, exercícios e acompanhamento de desempenho.

> Seguindo boas práticas de desenvolvimento limpo **(Clean Code)**, o sistema foi estruturado com foco em organização, escalabilidade e facilidade de manutenção, utilizando **Spring Data JPA** para gerenciamento da persistência dos dados.


#
### 🔧 **FUNCIONALIDADES**

- 🔐 **Autenticação e Controle de Acesso:**
Implementação de autenticação segura utilizando Spring Security e JWT, permitindo controle de acesso conforme o perfil do usuário (Administrador, Professor e Aluno).

- 👥 **Gerenciamento de Usuários:**
Cadastro e gerenciamento de usuários da plataforma, com diferentes níveis de permissão e funcionalidades específicas para cada perfil.

- 👨‍🏫 **Gestão de Professores e Turmas:**
Permite a organização de professores responsáveis por turmas, possibilitando o acompanhamento dos alunos vinculados.

- 👧 **Gestão de Alunos:**
Cadastro de estudantes e associação com suas respectivas turmas para utilização dos conteúdos educacionais.

- 📚 **Conteúdos Educacionais:**
Disponibilização exercícios voltados ao ensino de lógica de programação, organizados de forma didática para o público infantil.

- 📊 **Acompanhamento de Desempenho:**
Registro das atividades realizadas pelos alunos, permitindo que professores acompanhem o progresso e evolução dos estudantes.

- 📦 **Data Transfer Objects (DTOs):**
Utilização de DTOs para padronização das informações trafegadas entre o front-end e a API, garantindo separação de responsabilidades entre as camadas da aplicação.

- ⚠️ **Validação e Tratamento de Exceções Personalizado:**
Implementação de validações utilizando recursos do Spring, garantindo respostas padronizadas e melhor experiência durante o uso da aplicação.

- 💾 **Persistência de Dados com Spring Data JPA:**
Armazenamento das informações em banco relacional PostgreSQL, utilizando entidades e repositórios JPA para comunicação eficiente com a camada de dados.


#
### 🔄 **REPRESENTAÇÃO DE FLUXO**

> A representação de fluxo demonstra a arquitetura geral da aplicação, destacando a comunicação entre o usuário, interface web, API REST e banco de dados.

- **Arquitetura**

<div align="center">
  <img src="docs/modelagem/Fluxo.png" width="600px;">
</div>


#
### 🧩 **MODELAGEM DE PERSISTÊNCIA**

> Este diagrama apresenta a estrutura das entidades do sistema e seus relacionamentos, auxiliando no desenvolvimento e manutenção da aplicação.

<div align="center">
  <img src="docs/modelagem/Modelagem.png" width="700px;">
</div>


#
### 📌 **REQUISITOS**

Para executar nossa plataforma localmente, é necessário ter em seu dispositivo computacional:

  1. Certifique-se que instalou a versão **21 do Java**.  [Baixe aqui](https://www.oracle.com/java/technologies/javase/jdk21-archive-downloads.html)

  2. Certifique-se de que tenha instalado alguma **IDE** em sua máquina. [Baixe aqui](https://www.jetbrains.com/idea/download/?section=windows)

  3. Certifique-se de que tenha o **PostgreSQL** instalado. [Baixe aqui](https://www.postgresql.org/download/)


#
### ⬇️ **DOWNLOAD DO PROJETO**

Baixe o projeto em seu computador através do comando:

```bash
git clone https://github.com/Kauan-Ts16/uninter-ae-skillkids-platform.git
```

**ou**

1. Clique em `<> Code`.
2. Faça o download do arquivo ZIP.
3. Abra o seu explorador de arquivos na localização da instalação.
4. Extraia o arquivo ZIP.


#
### ▶️ **EXECUÇÃO**

Sequência de execução do projeto:

```
1.  Acesse a IDE na qual deseja executar o projeto.
2.  Clique em "Abrir um projeto já existente".
3.  Selecione o local da pasta descompactada do projeto.
4.  Confirme a seleção.
5.  Crie um banco de dados ou utilize um de teste.
6.  Altere o arquivo "application.properties" com o nome do banco e a senha.
7.  Localize e clique no botão "Play" (verde) localizado na parte superior da IDE.
8.  Um terminal integrado será aberto.
9.  Aguarde a instalação das dependências do projeto.
10. Após a conclusão das instalações, o projeto será executado.

AO FINAL DA EXECUÇÃO, VOCÊ PODERÁ TESTAR A APLICAÇÃO LOCALMENTE NO NAVEGADOR USANDO O DOMÍNIO ABAIXO.

```


#
### 💻 **TECNOLOGIAS**

#### 🔙 Backend

![Java](https://img.shields.io/badge/Java-0D1117?style=for-the-badge&logo=openjdk&logoColor=white&labelColor=0D1117)&nbsp;
![Spring](https://img.shields.io/badge/Spring-0D1117?style=for-the-badge&logo=spring&logoColor=107C10&labelColor=0D1117)&nbsp;
![SpringBoot](https://img.shields.io/badge/Spring_Boot-0D1117?style=for-the-badge&logo=springboot&logoColor=239120&labelColor=0D1117)&nbsp;
![SpringSecurity](https://img.shields.io/badge/Spring_Security-0D1117?style=for-the-badge&logo=Spring-Security&logoColor=239120&labelColor=0D1117)&nbsp;
![Hibernate](https://img.shields.io/badge/Hibernate-0D1117?style=for-the-badge&logo=Hibernate&logoColor=239120&labelColor=0D1117)&nbsp;
![Maven](https://img.shields.io/badge/apache_maven-0D1117?style=for-the-badge&logo=apachemaven&logoColor=E34F26&labelColor=0D1117)&nbsp;

#### 🌐 Frontend

![HTML](https://img.shields.io/badge/HTML-0D1117?style=for-the-badge&logo=html5&labelColor=0D1117)&nbsp;
![CSS](https://img.shields.io/badge/CSS-0D1117?style=for-the-badge&logo=CSS3&logoColor=1572B6&labelColor=0D1117)&nbsp;
![JavaScript](https://img.shields.io/badge/JavaScript-0D1117?style=for-the-badge&logo=javascript&labelColor=0D1117&textColor=0D1117)&nbsp;

#### 🛢 Banco de Dados

![POSTGRESQL](https://img.shields.io/badge/PostgreSQL-0D1117?style=for-the-badge&logo=postgresql&labelColor=0D1117)&nbsp;

#### 📘 Documentação

![Swagger](https://img.shields.io/badge/Swagger-0D1117?style=for-the-badge&logo=Swagger&logoColor=85EA2D&labelColor=0D1117)&nbsp;


#
### 🌐 DOMÍNIO DA API

```
http://localhost:8080
```


#
### 📚 DOCUMENTAÇAO DA API

```
http://localhost:8080/swagger-ui/index.html
```