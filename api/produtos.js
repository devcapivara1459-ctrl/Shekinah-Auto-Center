import { neon } from '@neondb/serverless';

export default async function handler(req, res) {
  // Ajuste de CORS para o seu domínio
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const sql = neon(process.env.DATABASE_URL);

  try {
    // Garante que a tabela existe no Neon
    await sql`CREATE TABLE IF NOT EXISTS produtos (
      id SERIAL PRIMARY KEY,
      nome TEXT,
      preco TEXT,
      imagem TEXT,
      categoria TEXT,
      tags TEXT,
      whatsapp TEXT
    )`;

    if (req.method === 'GET') {
      const rows = await sql`SELECT * FROM produtos ORDER BY id DESC`;
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const { nome, preco, imagem, categoria, tags, whatsapp } = req.body;
      const result = await sql`
        INSERT INTO produtos (nome, preco, imagem, categoria, tags, whatsapp)
        VALUES (${nome}, ${preco}, ${imagem}, ${categoria}, ${JSON.stringify(tags)}, ${whatsapp})
        RETURNING *`;
      return res.status(201).json(result[0]);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      await sql`DELETE FROM produtos WHERE id = ${id}`;
      return res.status(200).json({ message: "Eliminado" });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}