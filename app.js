const express = require('express');
const bodyParser = require('body-parser');
const path = require('path'); 
const fs = require('fs'); // Módulo para trabalhar com arquivos
const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Caminho para o arquivo JSON
const dataFilePath = path.join(__dirname, 'public', 'bd.json');

// Função para carregar os dados do arquivo JSON
const loadUserData = () => {
    const jsonData = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(jsonData);
};

// Função para salvar os dados no arquivo JSON
const saveUserData = (data) => {
    const jsonData = JSON.stringify(data, null, 2);
    fs.writeFileSync(dataFilePath, jsonData, 'utf8');
};

// Rota para servir login.html na raiz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});


// Rota para fornecer os dados dos filmes
app.get('/api/catalogo', (req, res) => {
    const dados = loadUserData();
    console.log('Dados dos filmes carregados:', dados.filmes);
    res.json(dados.filmes);
});

// Rota para servir o catalogo.html
app.get('/catalogo', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'catalogo.html'));
});

app.get('/detalhes', (req, res) => {
    const { id } = req.query; // Captura o parâmetro de consulta 'id'
    const dados = loadUserData();
    const filme = dados.filmes.find(f => f.id === parseInt(id));
    if (!filme) {
        return res.status(404).send('Filme não encontrado');
    }
    // Aqui, você pode renderizar a página de detalhes diretamente ou redirecionar para um arquivo HTML
    // Vou redirecionar para a página de detalhes.html
    res.redirect(`/detalhes.html?id=${id}`);
});

// Endpoint para login
app.post('/login', (req, res) => {
    console.log('Login request received');
    console.log('Request body:', req.body); // Log para depuração

    const { email, senha } = req.body;

    if (!email || !senha) {
        console.log('Email ou senha não fornecidos');
        return res.status(400).send('Email e senha são obrigatórios');
    }

    const dados = loadUserData();
    const usuarioExistente = dados.usuarios.find(u => u.email === email && u.senha === senha);
    if (!usuarioExistente) {
        console.log('Credenciais inválidas');
        return res.status(401).send('Credenciais inválidas');
    }

    console.log('Login bem-sucedido');
    res.redirect('/catalogo.html');
});

// Endpoint para cadastro
app.post('/cadastro', (req, res) => {
    console.log('Cadastro request received');
    console.log('Request body:', req.body); // Log para depuração

    const { nome, email, senha } = req.body;

    if (!email || !senha) {
        console.log('Usuário ou senha não fornecidos');
        return res.status(400).send('Usuário e senha são obrigatórios');
    }

    const dados = loadUserData();
    if (dados.usuarios.some(u => u.email === email)) {
        console.log('Usuário já existe');
        return res.status(400).send('Este usuário já existe');
    }

    const novoUsuario = {
        id: dados.usuarios.length + 1,
        nome,
        email,
        senha
    };
    dados.usuarios.push(novoUsuario);
    saveUserData(dados);

    console.log('Cadastro bem-sucedido');
    res.redirect('/login.html');
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
