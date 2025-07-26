# Template de E-mail Completo para EmailJS

## SUBJECT (Assunto):
```
Checklist - {{license_plate}} - {{driver_name}} - {{completion_date}}
```

## CONTENT (Corpo do E-mail em HTML):
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Checklist de Veículo</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 20px; 
            background-color: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header { 
            background: linear-gradient(135deg, #ea580c, #f97316);
            color: white; 
            padding: 30px 20px; 
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
        }
        .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .content { 
            padding: 30px;
        }
        .section { 
            margin-bottom: 30px;
            border-left: 4px solid #ea580c;
            padding-left: 20px;
        }
        .section h3 { 
            color: #ea580c; 
            margin-bottom: 15px;
            font-size: 20px;
            font-weight: 600;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        .info-item {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e9ecef;
        }
        .info-label { 
            font-weight: 600;
            color: #495057;
            display: block;
            margin-bottom: 5px;
        }
        .info-value {
            color: #212529;
            font-size: 16px;
        }
        .status-ok { 
            color: #28a745; 
            font-weight: bold;
            background-color: #d4edda;
            padding: 4px 8px;
            border-radius: 4px;
            display: inline-block;
        }
        .status-problem { 
            color: #dc3545; 
            font-weight: bold;
            background-color: #f8d7da;
            padding: 4px 8px;
            border-radius: 4px;
            display: inline-block;
        }
        .problems-section {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .problem-item {
            background-color: white;
            border: 1px solid #dee2e6;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 15px;
        }
        .problem-item:last-child {
            margin-bottom: 0;
        }
        .problem-description {
            color: #495057;
            margin-bottom: 10px;
        }
        .photo-link {
            color: #007bff;
            text-decoration: none;
            font-weight: 500;
        }
        .photo-link:hover {
            text-decoration: underline;
        }
        .observations-box {
            background-color: #e7f3ff;
            border: 1px solid #b8daff;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .footer { 
            background-color: #f8f9fa; 
            padding: 20px; 
            text-align: center; 
            font-size: 14px; 
            color: #6c757d;
            border-top: 1px solid #dee2e6;
        }
        .summary-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .stat-card {
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border: 1px solid #dee2e6;
        }
        .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #ea580c;
        }
        .stat-label {
            color: #6c757d;
            font-size: 14px;
            margin-top: 5px;
        }
        .verification-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
            margin: 15px 0;
        }
        .verification-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 15px;
            background-color: #f8f9fa;
            border-radius: 6px;
            border: 1px solid #e9ecef;
        }
        .verification-label {
            font-weight: 500;
            color: #495057;
        }
        .conditional-section {
            display: none;
        }
        .conditional-section.show {
            display: block;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚛 Checklist de Veículo Refrigerado</h1>
            <p>Sistema Automático de Controle de Qualidade</p>
        </div>
        
        <div class="content">
            <!-- Informações Gerais -->
            <div class="section">
                <h3>📋 Informações Gerais</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Data do Checklist:</span>
                        <span class="info-value">{{checklist_date}}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Finalizado em:</span>
                        <span class="info-value">{{completion_date}}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Motorista:</span>
                        <span class="info-value">{{driver_name}}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Tipo de Veículo:</span>
                        <span class="info-value">{{vehicle_type}}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Placa do Veículo:</span>
                        <span class="info-value">{{license_plate}}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Temperatura Inicial:</span>
                        <span class="info-value">{{initial_temperature}}</span>
                    </div>
                </div>
            </div>

            <!-- Resumo Estatístico -->
            <div class="section">
                <h3>📊 Resumo do Checklist</h3>
                <div class="summary-stats">
                    <div class="stat-card">
                        <div class="stat-number">{{problems_count}}</div>
                        <div class="stat-label">Problemas Encontrados</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">{{photos_count}}</div>
                        <div class="stat-label">Fotos Anexadas</div>
                    </div>
                </div>
            </div>

            <!-- Verificação Externa -->
            <div class="section">
                <h3>🔍 Verificação Externa do Veículo</h3>
                <div class="verification-grid">
                    <div class="verification-item">
                        <span class="verification-label">Pneus:</span>
                        <span class="{{tires_status_class}}">{{tires_status}}</span>
                    </div>
                    <div class="verification-item">
                        <span class="verification-label">Lanternas e Faróis:</span>
                        <span class="{{lights_status_class}}">{{lights_status}}</span>
                    </div>
                    <div class="verification-item">
                        <span class="verification-label">Retrovisores e Vidros:</span>
                        <span class="{{mirrors_status_class}}">{{mirrors_status}}</span>
                    </div>
                    <div class="verification-item">
                        <span class="verification-label">Lataria e Baú:</span>
                        <span class="{{bodywork_status_class}}">{{bodywork_status}}</span>
                    </div>
                    <div class="verification-item">
                        <span class="verification-label">Para-choques:</span>
                        <span class="{{bumpers_status_class}}">{{bumpers_status}}</span>
                    </div>
                    <div class="verification-item">
                        <span class="verification-label">Limpadores:</span>
                        <span class="{{wipers_status_class}}">{{wipers_status}}</span>
                    </div>
                </div>
            </div>

            <!-- Verificação Interna -->
            <div class="section">
                <h3>🏠 Verificação Interna / Cabine</h3>
                <div class="verification-grid">
                    <div class="verification-item">
                        <span class="verification-label">Combustível:</span>
                        <span class="{{fuel_status_class}}">{{fuel_status}}</span>
                    </div>
                    <div class="verification-item">
                        <span class="verification-label">Óleo do Motor:</span>
                        <span class="{{oil_status_class}}">{{oil_status}}</span>
                    </div>
                    <div class="verification-item">
                        <span class="verification-label">Água/Radiador:</span>
                        <span class="{{water_status_class}}">{{water_status}}</span>
                    </div>
                    <div class="verification-item">
                        <span class="verification-label">Painel:</span>
                        <span class="{{dashboard_status_class}}">{{dashboard_status}}</span>
                    </div>
                    <div class="verification-item">
                        <span class="verification-label">Extintor:</span>
                        <span class="{{extinguisher_status_class}}">{{extinguisher_status}}</span>
                    </div>
                    <div class="verification-item">
                        <span class="verification-label">Cintos:</span>
                        <span class="{{seatbelts_status_class}}">{{seatbelts_status}}</span>
                    </div>
                </div>
            </div>

            <!-- Sistema de Refrigeração -->
            <div class="section">
                <h3>❄️ Sistema de Refrigeração</h3>
                <div class="verification-grid">
                    <div class="verification-item">
                        <span class="verification-label">Equipamento Funcionando:</span>
                        <span class="{{refrigeration_status_class}}">{{refrigeration_status}}</span>
                    </div>
                    <div class="verification-item">
                        <span class="verification-label">Baú Limpo:</span>
                        <span class="{{chamber_status_class}}">{{chamber_status}}</span>
                    </div>
                    <div class="verification-item">
                        <span class="verification-label">Motor Refrigeração:</span>
                        <span class="{{motor_status_class}}">{{motor_status}}</span>
                    </div>
                    <div class="verification-item">
                        <span class="verification-label">Combustível Refrigerador:</span>
                        <span class="{{fuel_refrigerator_status_class}}">{{fuel_refrigerator_status}}</span>
                    </div>
                </div>
            </div>

            <!-- Documentação -->
            <div class="section">
                <h3>📄 Documentação</h3>
                <div class="verification-grid">
                    <div class="verification-item">
                        <span class="verification-label">CRLV:</span>
                        <span class="{{crlv_status_class}}">{{crlv_status}}</span>
                    </div>
                    <div class="verification-item">
                        <span class="verification-label">CNH:</span>
                        <span class="{{cnh_status_class}}">{{cnh_status}}</span>
                    </div>
                    <div class="verification-item">
                        <span class="verification-label">Documentos Entrega:</span>
                        <span class="{{documents_status_class}}">{{documents_status}}</span>
                    </div>
                    <div class="verification-item">
                        <span class="verification-label">Notas e Taxas:</span>
                        <span class="{{notes_status_class}}">{{notes_status}}</span>
                    </div>
                    <div class="verification-item">
                        <span class="verification-label">Tablet:</span>
                        <span class="{{tablet_status_class}}">{{tablet_status}}</span>
                    </div>
                </div>
            </div>

            <!-- Problemas Encontrados (Condicional) -->
            <div class="section conditional-section {{show_problems}}">
                <h3>⚠️ Problemas Encontrados ({{problems_count}})</h3>
                <div class="problems-section">
                    <div style="white-space: pre-line; font-size: 14px; line-height: 1.6;">{{problems_list}}</div>
                    <div class="conditional-section {{show_problem_photos}}" style="margin-top: 20px;">
                        <h4 style="color: #ea580c; margin-bottom: 10px;">📷 Fotos dos Problemas:</h4>
                        <div style="white-space: pre-line; font-size: 14px; line-height: 1.8;">{{problem_photos}}</div>
                    </div>
                </div>
            </div>

            <!-- Status Aprovado (Condicional) -->
            <div class="section conditional-section {{show_approved}}">
                <h3>✅ Status do Veículo</h3>
                <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 20px; text-align: center;">
                    <h4 style="color: #155724; margin: 0;">Nenhum Problema Encontrado</h4>
                    <p style="color: #155724; margin: 10px 0 0 0;">O veículo foi aprovado em todas as verificações.</p>
                </div>
            </div>

            <!-- Observações Gerais (Condicional) -->
            <div class="section conditional-section {{show_observations}}">
                <h3>📝 Observações Gerais</h3>
                <div class="observations-box">
                    <div style="white-space: pre-line; font-size: 14px; line-height: 1.6;">{{general_observations}}</div>
                </div>
            </div>

            <!-- Checklist Completo -->
            <div class="section">
                <h3>📋 Checklist Completo</h3>
                <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px;">
                    <div style="white-space: pre-line; font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.4; color: #495057;">{{checklist_summary}}</div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>ID do Checklist:</strong> {{checklist_id}}</p>
            <p>Este e-mail foi gerado automaticamente pelo Sistema de Checklist de Veículos</p>
            <p><strong>Data de Envio:</strong> {{completion_date}}</p>
            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 15px 0;">
            <p style="font-size: 12px; color: #6c757d;">© 2025 - Desenvolvido por Carlos Freitas | Sistema de Controle de Qualidade</p>
        </div>
    </div>
</body>
</html>
```

## Variáveis que você deve configurar no EmailJS:

### Configuração do Template:
1. **To Email**: `{{to_email}}`
2. **From Name**: `Sistema de Checklist`
3. **Reply To**: `{{reply_to}}`

### Variáveis disponíveis no template:
- `{{to_email}}` - E-mail de destino
- `{{from_name}}` - Nome do remetente
- `{{reply_to}}` - E-mail de resposta
- `{{driver_name}}` - Nome do motorista
- `{{completion_date}}` - Data/hora de finalização
- `{{vehicle_type}}` - Tipo do veículo
- `{{license_plate}}` - Placa
- `{{checklist_date}}` - Data do checklist
- `{{initial_temperature}}` - Temperatura inicial
- `{{problems_count}}` - Número de problemas
- `{{photos_count}}` - Número de fotos
- `{{problems_list}}` - Lista detalhada de problemas
- `{{problem_photos}}` - URLs das fotos
- `{{general_observations}}` - Observações gerais
- `{{checklist_id}}` - ID do checklist
- `{{checklist_summary}}` - Resumo completo do checklist

### Variáveis de status (true/false):
- `{{tires_ok}}`, `{{lights_ok}}`, `{{mirrors_ok}}`, `{{bodywork_ok}}`, `{{bumpers_ok}}`, `{{wipers_ok}}`
- `{{fuel_ok}}`, `{{oil_ok}}`, `{{water_ok}}`, `{{dashboard_ok}}`, `{{extinguisher_ok}}`, `{{seatbelts_ok}}`
- `{{refrigeration_ok}}`, `{{chamber_ok}}`, `{{motor_ok}}`, `{{fuel_refrigerator_ok}}`
- `{{crlv_ok}}`, `{{cnh_ok}}`, `{{documents_ok}}`, `{{notes_ok}}`, `{{tablet_ok}}`

## Instruções de Configuração:

1. **Copie o SUBJECT** e cole no campo "Subject" do template no EmailJS
2. **Copie o CONTENT** e cole no campo "Content" do template no EmailJS
3. Configure o e-mail de destino no código: `to_email: 'seu-email@empresa.com'`
4. Teste o template antes de usar em produção

O template está 100% em português brasileiro e formatado profissionalmente!