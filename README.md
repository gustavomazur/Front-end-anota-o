# Front-end Anotação

## Sobre o Projeto

Este Front-end foi desenvolvido utilizando ferramentas de IA por meio de Vibe Coding.

O objetivo deste projeto é fornecer uma interface simples para consumir e testar a API de anotações desenvolvida por mim.

Atualmente estou focado em estudos de Back-end com Java e Spring Boot. Para este projeto utilizei ferramentas de IA para desenvolver a interface em HTML, CSS e JavaScript.

### Interface web simples para testar a API de anotações.

---

## Como rodar o Front-end

### Passo 1

Crie uma pasta na sua máquina local.

### Passo 2

Clone o repositório dentro da pasta criada.

### Passo 3

Abra a pasta do projeto clonado.

### Passo 4

Localize o arquivo `index.html`.

### Passo 5

Clique com o botão direito no arquivo e abra com o Google Chrome.

A aplicação será aberta em uma nova aba do navegador.

---

## Pré-requisitos

### Front-end

* Navegador de sua preferência.
* Atenção o projeto foi testado apenas no Google Chrome.

### Back-end

* Java 17+
* Docker (para executar o MySQL)

---

## Como rodar o Back-end

```bash
# 1. Clone o repositório do Back-end
link: https://github.com/gustavomazur/Anotacao

# 2. Abra o projeto na IntelliJ IDEA ou em outra IDE de sua preferência

# 3. Inicie o MySQL com Docker
docker compose up -d

# 4. Configure as variáveis de ambiente

export DB_USERNAME=root
export DB_PASSWORD=sua-senha
export DB_NAME=mydatabase
export ANTHROPIC_API_KEY=sua-chave-nvidia

# 5. Inicie a API explicação mais detalhada no README.md do repositorio do back end
```

Após iniciar a API, basta abrir o Front-end e realizar os testes.

O Back-end estará disponível em:

```text
http://localhost:8080
```

---

## Funcionalidades

| Funcionalidade   | Descrição                                                 |
| ---------------- | --------------------------------------------------------- |
| Criar anotação   | Preencha o título e a anotação e clique em "Criar"        |
| Listar anotações | Exibe uma tabela com paginação de 10 registros por página |
| Editar anotação  | Clique em "Editar" no item desejado                       |
| Deletar anotação | Utilize o botão "Del" ou informe o ID da anotação         |
| Busca com IA     | Faça perguntas sobre suas anotações utilizando IA         |

---

## Estrutura do Projeto

```text
front-end-anotacao/
├── index.html      # Página principal
├── style.css       # Estilos da aplicação
└── script.js       # Lógica de consumo da API
```

* Interface criada apenas para testar a API do back-end e proporcionar uma visualização mais amigável.
* O objetivo foi facilitar os testes da aplicação, evitando a necessidade de utilizar apenas o Insomnia.
