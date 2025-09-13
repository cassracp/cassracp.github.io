const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core'); // IMPORTANTE: Importar o puppeteer-core

// A função getHtml para montar o layout do PDF permanece a mesma.
function getHtml(data) {
    const modules = data.modules || [];
    const activities = data.activities || [];

    const modulesHtml = modules.map(mod => `
        <div class="module-item">
            <span class="checkbox">☑</span>
            <span class="label">${mod.label}</span>
        </div>
    `).join('');

    const activitiesHtml = activities.map(act => `
        <tr>
            <td>${act.label}</td>
            <td>${act.date}</td>
        </tr>
    `).join('');

    return `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: sans-serif; font-size: 10px; color: #333; }
                .container { width: 90%; margin: auto; }
                .header, .footer { text-align: center; }
                .header img { max-width: 120px; }
                .section-title { font-weight: bold; background-color: #e9ecef; padding: 5px; margin: 15px 0 5px 0; text-align: center; }
                .info-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
                .info-table td { border: 1px solid #ccc; padding: 5px; }
                .info-table td:first-child { font-weight: bold; width: 30%; }
                .module-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 5px; margin-bottom: 15px; }
                .module-item { display: flex; align-items: center; }
                .checkbox { font-family: "DejaVu Sans", sans-serif; margin-right: 5px; }
                .summary-box { border: 1px solid #ccc; padding: 10px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="https://auxiliar-demaria.vercel.app/site/icons/icon_base96.png" alt="Logo">
                    <h4>PLANEJAMENTO DE IMPLANTAÇÃO REMOTA</h4>
                </div>
                <table class="info-table">
                    <tr><td>Cliente/Cartório:</td><td>${data.clienteNome || ''}</td></tr>
                    <tr><td>Oficial/Tabelião:</td><td>${data.clienteOficial || ''}</td></tr>
                    <tr><td>Responsável:</td><td>${data.clienteResponsavel || ''}</td></tr>
                </table>
                <div class="section-title">MÓDULOS CONTRATADOS</div>
                <div class="module-grid">${modulesHtml}</div>
                <div class="section-title">DATAS AGENDADAS</div>
                <table class="info-table">${activitiesHtml}</table>
                <div class="section-title">RESUMO E OBSERVAÇÕES</div>
                <div class="summary-box">
                    <p><strong>Total de agendamentos:</strong> ${data.totalAgendamentos} dias úteis de implantação.</p>
                    <p><strong>Período total:</strong> ${data.periodoCorridos} dias corridos.</p>
                    <hr>
                    <p style="font-size: 8px;">OBS: No agendamento de "Configurações Iniciais 1" será feita a instalação do Banco de Dados no Servidor...</p>
                </div>
            </div>
        </body>
        </html>
    `;
}


export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).send('Method Not Allowed');
    }

    let browser = null;
    try {
        const formData = request.body;
        if (!formData) {
            return response.status(400).json({ error: 'Corpo da requisição vazio.' });
        }
        
        const htmlContent = getHtml(formData);

        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
        });

        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
        });

        response.setHeader('Content-Type', 'application/pdf');
        response.setHeader('Content-Disposition', `attachment; filename="Planejamento-${formData.clienteNome || 'documento'}.pdf"`);
        
        return response.status(200).send(pdfBuffer);

    } catch (error) {
        console.error("ERRO FATAL NA API:", error);
        return response.status(500).json({ 
            error: 'Ocorreu um erro interno no servidor ao gerar o PDF.', 
            details: error.message 
        });
    } finally {
        if (browser !== null) {
            await browser.close();
        }
    }
}