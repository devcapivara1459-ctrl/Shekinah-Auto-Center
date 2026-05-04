import { neon } from '@neondb/serverless';

export default async function handler(req, res) {
    // Configuração de CORS para permitir acesso do seu site
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // Conexão com o banco usando a variável de ambiente que configuraremos na Vercel
    const sql = neon(process.env.DATABASE_URL);

    try {
        // 1. Cria a tabela se ela não existir (Roda automaticamente)
        await sql`
            CREATE TABLE IF NOT EXISTS produtos (
                id SERIAL PRIMARY KEY,
                nome TEXT NOT NULL,
                preco TEXT,
                imagem TEXT,
                categoria TEXT,
                tags JSONB,
                whatsapp TEXT,
                criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        // ROTA GET: Busca os produtos para o Index.html
        if (req.method === 'GET') {
            const rows = await sql`SELECT * FROM produtos ORDER BY criado_em DESC`;
            return res.status(200).json(rows);
        }

        // ROTA POST: Salva um novo produto vindo do Admin
        if (req.method === 'POST') {
            const { nome, preco, imagem, categoria, tags, whatsapp } = req.body;
            const result = await sql`
                INSERT INTO produtos (nome, preco, imagem, categoria, tags, whatsapp)
                VALUES (${nome}, ${preco}, ${imagem}, ${categoria}, ${JSON.stringify(tags)}, ${whatsapp})
                RETURNING *
            `;
            return res.status(201).json(result[0]);
        }

        // ROTA DELETE: Exclui um produto pelo ID
        if (req.method === 'DELETE') {
            const { id } = req.query;
            await sql`DELETE FROM produtos WHERE id = ${id}`;
            return res.status(200).json({ message: "Produto excluído com sucesso" });
        }

    } catch (error) {
        console.error('Erro na API:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
}