const API_BASE = 'http://localhost:8080';
const PAGE_SIZE = 10;

let paginaAtual = 0;
let totalPaginas = 0;

const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

function mostrarToast(mensagem, tipo = 'success') {
    const toast = $('toast');
    toast.textContent = mensagem;
    toast.className = `toast show ${tipo}`;
    setTimeout(() => toast.classList.remove('show'), 4000);
}

function formatarData(dataISO) {
    if (!dataISO) return '-';
    const d = new Date(dataISO);
    return d.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function truncate(texto, max = 120) {
    if (!texto) return '-';
    return texto.length > max ? texto.slice(0, max) + '...' : texto;
}

async function request(method, url, body) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(url, options);

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Erro ${response.status}`);
    }

    if (response.status === 204) return null;

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return response.json();
    }
    return response.text();
}

async function carregarAnotacoes(pagina) {
    try {
        const data = await request('GET', `${API_BASE}/anotacoes/listar?pagina=${pagina}`);
        paginaAtual = data.number;
        totalPaginas = data.totalPages;
        renderizarLista(data.content);
        renderizarPaginacao();
        $('totalCount').textContent = `${data.totalElements} anotação${data.totalElements !== 1 ? 'ões' : ''}`;
    } catch (err) {
        mostrarToast('Erro ao carregar anotações: ' + err.message, 'error');
    }
}

function renderizarLista(anotacoes) {
    const tbody = $('tbodyAnotacoes');
    const cardList = $('listaMobile');
    const emptyState = $('emptyState');

    if (anotacoes.length === 0) {
        tbody.innerHTML = '';
        cardList.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }
    emptyState.classList.add('hidden');

    tbody.innerHTML = anotacoes.map(a => `
        <tr>
            <td class="id-cell">${a.id}</td>
            <td><strong>${escapeHtml(a.titulo)}</strong></td>
            <td><div class="anotacao-cell">${escapeHtml(truncate(a.anotacao, 100))}</div></td>
            <td class="date-cell hide-mobile">${formatarData(a.criadoEm)}</td>
            <td class="actions-cell">
                <button class="btn btn-sm-edit" data-id="${a.id}" onclick="abrirModalEdicao(${a.id})">Editar</button>
                <button class="btn btn-sm-delete" data-id="${a.id}" onclick="deletarItem(${a.id})">Del</button>
            </td>
        </tr>
    `).join('');

    cardList.innerHTML = anotacoes.map(a => `
        <div class="card">
            <div class="card-header">
                <span class="card-id">#${a.id}</span>
                <div class="card-actions">
                    <button class="btn btn-sm-edit" onclick="abrirModalEdicao(${a.id})">Editar</button>
                    <button class="btn btn-sm-delete" onclick="deletarItem(${a.id})">Del</button>
                </div>
            </div>
            <div class="card-titulo">${escapeHtml(a.titulo)}</div>
            <div class="card-anotacao">${escapeHtml(truncate(a.anotacao, 150))}</div>
            <div class="card-footer">
                <span>${formatarData(a.criadoEm)}</span>
            </div>
        </div>
    `).join('');
}

function escapeHtml(texto) {
    if (!texto) return '';
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

function renderizarPaginacao() {
    const nav = $('paginacao');
    if (totalPaginas <= 1) {
        nav.innerHTML = '';
        return;
    }

    let html = '';

    html += `<button ${paginaAtual === 0 ? 'disabled' : ''} onclick="irPagina(${paginaAtual - 1})">&laquo;</button>`;

    let inicio = Math.max(0, paginaAtual - 2);
    let fim = Math.min(totalPaginas, paginaAtual + 3);

    if (inicio > 0) {
        html += `<button onclick="irPagina(0)">1</button>`;
        if (inicio > 1) html += `<button disabled>...</button>`;
    }

    for (let i = inicio; i < fim; i++) {
        html += `<button class="${i === paginaAtual ? 'active' : ''}" onclick="irPagina(${i})">${i + 1}</button>`;
    }

    if (fim < totalPaginas) {
        if (fim < totalPaginas - 1) html += `<button disabled>...</button>`;
        html += `<button onclick="irPagina(${totalPaginas - 1})">${totalPaginas}</button>`;
    }

    html += `<button ${paginaAtual >= totalPaginas - 1 ? 'disabled' : ''} onclick="irPagina(${paginaAtual + 1})">&raquo;</button>`;

    nav.innerHTML = html;
}

function irPagina(pagina) {
    if (pagina < 0 || pagina >= totalPaginas) return;
    carregarAnotacoes(pagina);
}

async function criarAnotacao() {
    const titulo = $('titulo').value.trim();
    const anotacao = $('anotacao').value.trim();

    if (!titulo) {
        mostrarToast('O campo Título é obrigatório.', 'error');
        $('titulo').focus();
        return;
    }
    if (!anotacao) {
        mostrarToast('O campo Anotação é obrigatório.', 'error');
        $('anotacao').focus();
        return;
    }

    try {
        await request('POST', `${API_BASE}/anotacoes`, { titulo, anotacao });
        mostrarToast('Anotação criada com sucesso!');
        $('titulo').value = '';
        $('anotacao').value = '';
        carregarAnotacoes(0);
    } catch (err) {
        mostrarToast('Erro ao criar: ' + err.message, 'error');
    }
}

async function deletarPorId() {
    const id = $('deletarId').value.trim();
    if (!id) {
        mostrarToast('Digite um ID para deletar.', 'error');
        return;
    }

    if (!confirm(`Tem certeza que deseja deletar a anotação ID ${id}?`)) return;

    try {
        await request('DELETE', `${API_BASE}/anotacoes/${id}`);
        mostrarToast(`Anotação ID ${id} deletada com sucesso!`);
        $('deletarId').value = '';
        carregarAnotacoes(paginaAtual);
    } catch (err) {
        mostrarToast('Erro ao deletar: ' + err.message, 'error');
    }
}

async function deletarItem(id) {
    if (!confirm(`Tem certeza que deseja deletar a anotação ID ${id}?`)) return;

    try {
        await request('DELETE', `${API_BASE}/anotacoes/${id}`);
        mostrarToast(`Anotação ID ${id} deletada com sucesso!`);
        carregarAnotacoes(paginaAtual);
    } catch (err) {
        mostrarToast('Erro ao deletar: ' + err.message, 'error');
    }
}

async function abrirModalEdicao(id) {
    try {
        const anotacao = await request('GET', `${API_BASE}/anotacoes/${id}`);
        $('editId').value = anotacao.id;
        $('editTitulo').value = anotacao.titulo;
        $('editAnotacao').value = anotacao.anotacao;
        $('modalEdicao').classList.remove('hidden');
    } catch (err) {
        mostrarToast('Erro ao carregar anotação para edição: ' + err.message, 'error');
    }
}

function fecharModal() {
    $('modalEdicao').classList.add('hidden');
}

async function salvarEdicao() {
    const id = $('editId').value;
    const titulo = $('editTitulo').value.trim();
    const anotacao = $('editAnotacao').value.trim();

    if (!titulo) {
        mostrarToast('O campo Título é obrigatório.', 'error');
        $('editTitulo').focus();
        return;
    }
    if (!anotacao) {
        mostrarToast('O campo Anotação é obrigatório.', 'error');
        $('editAnotacao').focus();
        return;
    }

    try {
        await request('PUT', `${API_BASE}/anotacoes/${id}`, { titulo, anotacao });
        mostrarToast('Anotação atualizada com sucesso!');
        fecharModal();
        carregarAnotacoes(paginaAtual);
    } catch (err) {
        mostrarToast('Erro ao atualizar: ' + err.message, 'error');
    }
}

async function pesquisarIA() {
    const termo = $('iaBusca').value.trim();
    const divResposta = $('iaResposta');

    if (!termo) {
        mostrarToast('Digite um termo para pesquisar.', 'error');
        return;
    }

    try {
        divResposta.textContent = 'Pesquisando...';
        divResposta.classList.remove('hidden');
        const resposta = await request('GET', `${API_BASE}/Ianotacao/${encodeURIComponent(termo)}`);
        divResposta.textContent = typeof resposta === 'string' ? resposta : resposta;
    } catch (err) {
        divResposta.textContent = '';
        divResposta.classList.add('hidden');
        mostrarToast('Erro na pesquisa: ' + err.message, 'error');
    }
}

$('btnCriar').addEventListener('click', criarAnotacao);
$('btnDeletar').addEventListener('click', deletarPorId);
$('btnIaBusca').addEventListener('click', pesquisarIA);
$('btnFecharModal').addEventListener('click', fecharModal);
$('btnCancelarEdicao').addEventListener('click', fecharModal);
$('btnSalvarEdicao').addEventListener('click', salvarEdicao);

$('modalEdicao').addEventListener('click', (e) => {
    if (e.target === $('modalEdicao')) fecharModal();
});

$('iaBusca').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') pesquisarIA();
});

carregarAnotacoes(0);
