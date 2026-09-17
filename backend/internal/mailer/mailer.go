package mailer

import (
	"crypto/tls"
	"fmt"
	"log"
	"net"
	"net/smtp"
	"strings"
	"time"

	"miestudio/backend/internal/config"
)

// Mailer define las operaciones de envío de correos transaccionales
type Mailer interface {
	SendWelcomeEmail(toEmail, userName string) error
	SendVerificationEmail(toEmail, userName, verifyURL string, expireHours int) error
	SendPasswordResetEmail(toEmail, userName, resetURL string, expireMinutes int) error
	SendPasswordChangedEmail(toEmail, userName string) error
}

type smtpMailer struct {
	host        string
	port        string
	user        string
	password    string
	from        string
	frontendURL string
}

// NewMailer inicializa el servicio de correo según la configuración
func NewMailer(cfg *config.Config) Mailer {
	return &smtpMailer{
		host:        strings.TrimSpace(cfg.SMTPHost),
		port:        strings.TrimSpace(cfg.SMTPPort),
		user:        strings.TrimSpace(cfg.SMTPUser),
		password:    strings.TrimSpace(cfg.SMTPPassword),
		from:        strings.TrimSpace(cfg.SMTPFrom),
		frontendURL: strings.TrimRight(cfg.FrontendURL, "/"),
	}
}

// isConfigured verifica si hay credenciales SMTP provistas
func (m *smtpMailer) isConfigured() bool {
	return m.host != "" && m.port != ""
}

// SendWelcomeEmail envía un correo de bienvenida tras el registro
func (m *smtpMailer) SendWelcomeEmail(toEmail, userName string) error {
	subject := "¡Te damos la bienvenida a miEstudio! 🎓"
	dashboardURL := fmt.Sprintf("%s/dashboard", m.frontendURL)

	textBody := fmt.Sprintf(`Hola %s,

¡Te damos una cálida bienvenida a miEstudio! Tu cuenta ha sido creada exitosamente.

A partir de ahora podés:
- Organizar tu plan de estudios y registrar tus materias.
- Armar tus horarios de cursada semanales y hacer seguimiento de tus parciales y finales.
- Crear apuntes interactivos potenciados con Inteligencia Artificial.
- Visualizar tu progreso académico y promedio general.

Accedé a tu espacio de estudio: %s

El equipo de miEstudio.
`, userName, dashboardURL)

	htmlBody := fmt.Sprintf(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido a miEstudio</title>
</head>
<body style="margin: 0; padding: 0; background-color: #090d16; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="background-color: #090d16; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%%" max-width="560px" style="max-width: 560px; background-color: #0f172a; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.08); overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 20px 32px; text-align: center; background: linear-gradient(180deg, rgba(59, 130, 246, 0.12) 0%%, rgba(15, 23, 42, 0) 100%%);">
              <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; border-radius: 12px; background: #2563eb; color: #ffffff; font-size: 24px; font-weight: bold; margin-bottom: 12px; box-shadow: 0 8px 16px rgba(37, 99, 235, 0.3);">
                mE
              </div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #f8fafc; letter-spacing: -0.02em;">miEstudio</h1>
              <p style="margin: 6px 0 0 0; font-size: 14px; color: #94a3b8;">Tu workspace académico universitario</p>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 20px 32px 32px 32px;">
              <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #f8fafc;">¡Hola %s! 👋</h2>
              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #cbd5e1;">
                Tu cuenta ha sido creada con éxito. Nos alegra acompañarte en tu trayectoria universitaria para que alcances tus metas académicas con orden, foco y constancia.
              </p>
              
              <!-- Feature List -->
              <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 28px;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06);">
                    <strong style="color: #60a5fa;">📚 Gestión de Materias y Malla:</strong>
                    <div style="font-size: 13px; color: #94a3b8; margin-top: 2px;">Organizá cursadas, correlatividades y seguimiento de notas finales.</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06);">
                    <strong style="color: #34d399;">🗓️ Calendario y Horarios:</strong>
                    <div style="font-size: 13px; color: #94a3b8; margin-top: 2px;">Planificá tus semanas, entregas y fechas clave de parciales.</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;">
                    <strong style="color: #fbbf24;">🤖 Apuntes con IA:</strong>
                    <div style="font-size: 13px; color: #94a3b8; margin-top: 2px;">Generá resúmenes, fichas de estudio y preguntas clave con Copilot.</div>
                  </td>
                </tr>
              </table>

              <!-- Action Button -->
              <table width="100%%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 10px 0 20px 0;">
                    <a href="%s" target="_blank" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 12px 28px; border-radius: 8px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);">
                      Ingresar a miEstudio &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0 0; font-size: 13px; line-height: 1.5; color: #64748b; text-align: center;">
                Si tenés alguna duda o sugerencia, podés responder a este correo.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #0b1120; border-top: 1px solid rgba(255, 255, 255, 0.05); text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #475569;">
                &copy; %d miEstudio. Diseñado para estudiantes con vocación de excelencia.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`, userName, dashboardURL, time.Now().Year())

	return m.sendEmail(toEmail, subject, textBody, htmlBody)
}

// SendPasswordResetEmail envía el enlace seguro con token temporal para restablecer la contraseña
func (m *smtpMailer) SendPasswordResetEmail(toEmail, userName, resetURL string, expireMinutes int) error {
	subject := "Restablecé tu contraseña de miEstudio 🔐"

	textBody := fmt.Sprintf(`Hola %s,

Recibimos una solicitud para restablecer la contraseña de tu cuenta en miEstudio.

Para continuar con el restablecimiento, hacé clic en el siguiente enlace o copialo en tu navegador:
%s

Este enlace es de un solo uso y expirará en %d minutos.

Si vos no solicitaste este cambio, podés ignorar este correo; tu contraseña permanecerá segura y sin modificaciones.

El equipo de miEstudio.
`, userName, resetURL, expireMinutes)

	htmlBody := fmt.Sprintf(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restablecer Contraseña</title>
</head>
<body style="margin: 0; padding: 0; background-color: #090d16; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="background-color: #090d16; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%%" max-width="560px" style="max-width: 560px; background-color: #0f172a; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.08); overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 20px 32px; text-align: center; background: linear-gradient(180deg, rgba(59, 130, 246, 0.12) 0%%, rgba(15, 23, 42, 0) 100%%);">
              <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; border-radius: 12px; background: #2563eb; color: #ffffff; font-size: 24px; font-weight: bold; margin-bottom: 12px; box-shadow: 0 8px 16px rgba(37, 99, 235, 0.3);">
                🔐
              </div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #f8fafc; letter-spacing: -0.02em;">miEstudio</h1>
              <p style="margin: 6px 0 0 0; font-size: 14px; color: #94a3b8;">Restablecimiento de Contraseña</p>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 20px 32px 32px 32px;">
              <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #f8fafc;">Hola %s,</h2>
              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #cbd5e1;">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta de <strong>miEstudio</strong>. Hacé clic en el siguiente botón para elegir una nueva contraseña:
              </p>

              <!-- Action Button -->
              <table width="100%%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 12px 0 24px 0;">
                    <a href="%s" target="_blank" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 13px 32px; border-radius: 8px; box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);">
                      Restablecer mi Contraseña &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Notice Box -->
              <div style="background-color: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 8px; padding: 14px 16px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #fcd34d;">
                  ⏱️ <strong>Seguridad:</strong> Este enlace es personal, de un solo uso y expirará en <strong>%d minutos</strong>.
                </p>
              </div>

              <!-- Fallback Link -->
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748b;">
                Si el botón no funciona, copiá y pegá esta URL en tu navegador:
              </p>
              <p style="margin: 0 0 24px 0; font-size: 12px; word-break: break-all; color: #38bdf8; background: #090d16; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);">
                %s
              </p>

              <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #94a3b8;">
                Si no solicitaste este cambio, podés desestimar este mensaje; tu contraseña actual continúa siendo segura.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #0b1120; border-top: 1px solid rgba(255, 255, 255, 0.05); text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #475569;">
                &copy; %d miEstudio. Sistema seguro de autenticación universitaria.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`, userName, resetURL, expireMinutes, resetURL, time.Now().Year())

	return m.sendEmail(toEmail, subject, textBody, htmlBody)
}

// SendPasswordChangedEmail confirma al usuario que su contraseña fue cambiada
func (m *smtpMailer) SendPasswordChangedEmail(toEmail, userName string) error {
	subject := "Tu contraseña de miEstudio fue modificada 🛡️"

	textBody := fmt.Sprintf(`Hola %s,

Te confirmamos que la contraseña de tu cuenta en miEstudio ha sido modificada correctamente.

Si vos realizaste esta acción, no necesitás hacer nada más.
Si NO reconocés este cambio, por favor comunicate de inmediato o solicitá un nuevo restablecimiento para proteger tu cuenta.

El equipo de miEstudio.
`, userName)

	htmlBody := fmt.Sprintf(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contraseña Modificada</title>
</head>
<body style="margin: 0; padding: 0; background-color: #090d16; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="background-color: #090d16; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%%" max-width="560px" style="max-width: 560px; background-color: #0f172a; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.08); overflow: hidden;">
          <tr>
            <td style="padding: 32px; text-align: center;">
              <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; border-radius: 12px; background: #10b981; color: #ffffff; font-size: 24px; font-weight: bold; margin-bottom: 12px;">
                ✓
              </div>
              <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #f8fafc;">Contraseña Actualizada</h2>
              <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
                Hola <strong>%s</strong>, te confirmamos que la contraseña de tu cuenta en <strong>miEstudio</strong> ha sido modificada con éxito.
              </p>
              <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #94a3b8;">
                Si realizaste este cambio, podés ignorar este correo. Si no fuiste vos, te recomendamos restablecer tu acceso inmediatamente.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`, userName)

	return m.sendEmail(toEmail, subject, textBody, htmlBody)
}

// SendVerificationEmail envía el enlace seguro para confirmar y activar la cuenta
func (m *smtpMailer) SendVerificationEmail(toEmail, userName, verifyURL string, expireHours int) error {
	subject := "Confirmá tu cuenta de miEstudio ✉️"

	textBody := fmt.Sprintf(`Hola %s,

¡Gracias por registrarte en miEstudio!

Para confirmar tu dirección de correo electrónico y activar tu cuenta, hacé clic en el siguiente enlace o copialo en tu navegador:
%s

Este enlace de verificación es de un solo uso y expirará en %d horas.

Si vos no te registraste en miEstudio, por favor ignorá este mensaje.

El equipo de miEstudio.
`, userName, verifyURL, expireHours)

	htmlBody := fmt.Sprintf(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmá tu Cuenta</title>
</head>
<body style="margin: 0; padding: 0; background-color: #090d16; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="background-color: #090d16; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%%" max-width="560px" style="max-width: 560px; background-color: #0f172a; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.08); overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 20px 32px; text-align: center; background: linear-gradient(180deg, rgba(59, 130, 246, 0.12) 0%%, rgba(15, 23, 42, 0) 100%%);">
              <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; border-radius: 12px; background: #2563eb; color: #ffffff; font-size: 24px; font-weight: bold; margin-bottom: 12px; box-shadow: 0 8px 16px rgba(37, 99, 235, 0.3);">
                ✉️
              </div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #f8fafc; letter-spacing: -0.02em;">miEstudio</h1>
              <p style="margin: 6px 0 0 0; font-size: 14px; color: #94a3b8;">Confirmación de Correo Electrónico</p>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 20px 32px 32px 32px;">
              <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #f8fafc;">¡Hola %s! 👋</h2>
              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #cbd5e1;">
                ¡Gracias por sumarte a <strong>miEstudio</strong>! Para verificar tu cuenta y garantizar la seguridad de tus datos académicos, confirmá tu dirección de correo electrónico haciendo clic en el siguiente botón:
              </p>

              <!-- Action Button -->
              <table width="100%%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 12px 0 24px 0;">
                    <a href="%s" target="_blank" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 13px 32px; border-radius: 8px; box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);">
                      Confirmar mi Cuenta &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Notice Box -->
              <div style="background-color: rgba(59, 130, 246, 0.08); border: 1px solid rgba(59, 130, 246, 0.25); border-radius: 8px; padding: 14px 16px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #93c5fd;">
                  ℹ️ <strong>Validez:</strong> Este enlace de confirmación es de un solo uso y expirará en <strong>%d horas</strong>.
                </p>
              </div>

              <!-- Fallback Link -->
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748b;">
                Si el botón no funciona, podés copiar y pegar este enlace en tu navegador:
              </p>
              <p style="margin: 0 0 24px 0; font-size: 12px; word-break: break-all; color: #38bdf8; background: #090d16; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);">
                %s
              </p>

              <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #94a3b8;">
                Si vos no creaste una cuenta en miEstudio, podés ignorar este mensaje.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #0b1120; border-top: 1px solid rgba(255, 255, 255, 0.05); text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #475569;">
                &copy; %d miEstudio. Diseñado para estudiantes con vocación de excelencia.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`, userName, verifyURL, expireHours, verifyURL, time.Now().Year())

	return m.sendEmail(toEmail, subject, textBody, htmlBody)
}

// sendEmail realiza el despacho vía SMTP o fallback local
func (m *smtpMailer) sendEmail(toEmail, subject, textBody, htmlBody string) error {
	boundary := "==miEstudio_MIME_boundary=="
	headers := make(map[string]string)
	headers["From"] = m.from
	headers["To"] = toEmail
	headers["Subject"] = subject
	headers["MIME-Version"] = "1.0"
	headers["Content-Type"] = fmt.Sprintf("multipart/alternative; boundary=\"%s\"", boundary)
	headers["Date"] = time.Now().Format(time.RFC1123Z)

	messageBuilder := strings.Builder{}
	for k, v := range headers {
		messageBuilder.WriteString(fmt.Sprintf("%s: %s\r\n", k, v))
	}
	messageBuilder.WriteString("\r\n")

	// Texto Plano
	messageBuilder.WriteString(fmt.Sprintf("--%s\r\n", boundary))
	messageBuilder.WriteString("Content-Type: text/plain; charset=utf-8\r\n")
	messageBuilder.WriteString("Content-Transfer-Encoding: 7bit\r\n\r\n")
	messageBuilder.WriteString(textBody)
	messageBuilder.WriteString("\r\n\r\n")

	// HTML
	messageBuilder.WriteString(fmt.Sprintf("--%s\r\n", boundary))
	messageBuilder.WriteString("Content-Type: text/html; charset=utf-8\r\n")
	messageBuilder.WriteString("Content-Transfer-Encoding: 7bit\r\n\r\n")
	messageBuilder.WriteString(htmlBody)
	messageBuilder.WriteString("\r\n\r\n")

	messageBuilder.WriteString(fmt.Sprintf("--%s--\r\n", boundary))

	rawMessage := []byte(messageBuilder.String())

	// Si no hay SMTP configurado, usar fallback a consola (modo desarrollo)
	if !m.isConfigured() {
		m.logDevConsole(toEmail, subject, textBody)
		return nil
	}

	// Intento de envío SMTP real
	addr := fmt.Sprintf("%s:%s", m.host, m.port)
	var auth smtp.Auth
	if m.user != "" && m.password != "" {
		auth = smtp.PlainAuth("", m.user, m.password, m.host)
	}

	err := m.sendWithTLSFallback(addr, auth, toEmail, rawMessage)
	if err != nil {
		log.Printf("⚠️  [MAILER] Falló el envío SMTP hacia %s (%v). Mostrando en consola de desarrollo:", toEmail, err)
		m.logDevConsole(toEmail, subject, textBody)
		return nil // No interrumpir al usuario en dev si SMTP falla
	}

	log.Printf("📧 [MAILER] Correo enviado exitosamente a %s con asunto: '%s'", toEmail, subject)
	return nil
}

// sendWithTLSFallback gestiona la conexión SMTP con soporte STARTTLS y TLS directo
func (m *smtpMailer) sendWithTLSFallback(addr string, auth smtp.Auth, toEmail string, msg []byte) error {
	// Extraer dirección limpia del campo From
	fromClean := m.from
	if strings.Contains(fromClean, "<") && strings.Contains(fromClean, ">") {
		start := strings.Index(fromClean, "<") + 1
		end := strings.Index(fromClean, ">")
		fromClean = fromClean[start:end]
	}

	// Si es puerto 465 (SMTPS), conectar con TLS directo
	if m.port == "465" {
		tlsConfig := &tls.Config{
			ServerName: m.host,
		}
		conn, err := tls.Dial("tcp", addr, tlsConfig)
		if err != nil {
			return err
		}
		defer conn.Close()

		client, err := smtp.NewClient(conn, m.host)
		if err != nil {
			return err
		}
		defer client.Quit()

		if auth != nil {
			if ok, _ := client.Extension("AUTH"); ok {
				if err := client.Auth(auth); err != nil {
					return err
				}
			}
		}

		if err := client.Mail(fromClean); err != nil {
			return err
		}
		if err := client.Rcpt(toEmail); err != nil {
			return err
		}
		w, err := client.Data()
		if err != nil {
			return err
		}
		if _, err := w.Write(msg); err != nil {
			return err
		}
		return w.Close()
	}

	// Para puertos como 587 o 25, usar conexión estándar con STARTTLS
	host, _, _ := net.SplitHostPort(addr)
	client, err := smtp.Dial(addr)
	if err != nil {
		return err
	}
	defer client.Quit()

	if ok, _ := client.Extension("STARTTLS"); ok {
		tlsConfig := &tls.Config{
			ServerName: host,
		}
		if err := client.StartTLS(tlsConfig); err != nil {
			return err
		}
	}

	if auth != nil {
		if ok, _ := client.Extension("AUTH"); ok {
			if err := client.Auth(auth); err != nil {
				return err
			}
		}
	}

	if err := client.Mail(fromClean); err != nil {
		return err
	}
	if err := client.Rcpt(toEmail); err != nil {
		return err
	}
	w, err := client.Data()
	if err != nil {
		return err
	}
	if _, err := w.Write(msg); err != nil {
		return err
	}
	return w.Close()
}

// logDevConsole registra discretamente la simulación de correo cuando no hay SMTP configurado
func (m *smtpMailer) logDevConsole(toEmail, subject, textBody string) {
	log.Printf("ℹ️ [MAILER] Simulación dev (sin SMTP configurado): correo para %s | Asunto: '%s'", toEmail, subject)
}
