const pool = require ("../config/db");

class ReportModel {
  // Create a new report based on a template
  async create({
    userId,
    workspaceId,
    templateId,
    title,
    reportType,
    templateContent,
  }) {
    const query = `
      INSERT INTO reports (
        user_id, workspace_id, template_id, title, report_type, 
        original_content, current_content
      )
      VALUES ($1, $2, $3, $4, $5, $6, $6) 
      RETURNING *;
    `;
    // Note: We set both original_content and current_content to the template's content initially
    const values = [
      userId,
      workspaceId,
      templateId,
      title,
      reportType,
      templateContent,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  async getById(id) {
    const query = "SELECT * FROM reports WHERE id = $1";
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  async getByUserId(userId) {
    const query =
      "SELECT * FROM reports WHERE user_id = $1 ORDER BY created_at DESC";
    const { rows } = await pool.query(query, [userId]);
    return rows;
  }

  async updateContent(id, newContent) {
    const query = `
      UPDATE reports 
      SET current_content = $1, updated_at = NOW() 
      WHERE id = $2 
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [newContent, id]);
    return rows[0];
  }

  async createFromAudio(
    userId,
    workspaceId,
    reportType,
    reportContent,
    mediaUrl,
  ) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // 1. Insert the Report
      // original_content is empty because it's a brand new report from scratch
      const reportQuery = `
        INSERT INTO reports (user_id, workspace_id, report_type, original_content, current_content, status)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id;
      `;
      const emptyTiptap = { type: "doc", content: [] };
      const reportRes = await client.query(reportQuery, [
        userId,
        workspaceId,
        reportType,
        JSON.stringify(emptyTiptap),
        JSON.stringify(reportContent),
        "completed",
      ]);
      const reportId = reportRes.rows[0].id;

      // 2. Insert the Media entry
      const mediaQuery = `
        INSERT INTO media (report_id, file_url, media_type, metadata)
        VALUES ($1, $2, $3, $4)
      `;
      await client.query(mediaQuery, [
        reportId,
        mediaUrl,
        "audio",
        JSON.stringify({ note: "Generated from audio upload" }),
      ]);

      await client.query("COMMIT");
      return reportId;
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }
}

module.exports = new ReportModel();
