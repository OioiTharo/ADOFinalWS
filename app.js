const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
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

// Rota para fornecer os detalhes do filme pelo ID
app.get('/api/filme/:id', (req, res) => {
    const { id } = req.params;
    const dataFilePath = path.join(__dirname, 'public', 'bd.json');
    const jsonData = fs.readFileSync(dataFilePath, 'utf8');
    const movies = JSON.parse(jsonData).filmes;
    const movie = movies.find(movie => movie.id === parseInt(id));
    if (movie) {
        res.json(movie);
    } else {
        res.status(404).json({ error: 'Movie not found' });
    }
});

// Rota para fornecer a lista de filmes
app.get('/api/catalogo', (req, res) => {
    const jsonData = fs.readFileSync(dataFilePath, 'utf8');
    const movies = JSON.parse(jsonData).filmes;
    res.json(movies);
});

// Rota para servir login.html na raiz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Rota para servir catalogo.html
app.get('/catalogo.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'catalogo.html'));
});

// Rota para servir carrinho.html
app.get('/carrinho.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'carrinho.html'));
});

// Rota para servir detalhes.html
app.get('/detalhes.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'detalhes.html'));
});

// Endpoint para login
app.post('/login', (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha) {
        return res.status(400).send('Email e senha são obrigatórios');
    }

    const dados = loadUserData();
    const usuarioExistente = dados.usuarios.find(u => u.email === email && u.senha === senha);
    if (!usuarioExistente) {
        return res.status(401).send('Credenciais inválidas');
    }

    res.redirect('/catalogo.html');
});

// Endpoint para cadastro
app.post('/cadastro', (req, res) => {
    const { nome, email, senha } = req.body;
    if (!email || !senha) {
        return res.status(400).send('Usuário e senha são obrigatórios');
    }

    const dados = loadUserData();
    if (dados.usuarios.some(u => u.email === email)) {
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

    res.redirect('/login.html');
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
