/**
 * NCC Digital Portal - Email Templates
 * Premium responsive HTML templates matching the NCC Navy/Gold military aesthetic.
 */

const buildBaseTemplate = ({ title, bodyHtml, ctaText, ctaLink }) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
          background-color: #050d1a;
          margin: 0;
          padding: 0;
          -webkit-font-smoothing: antialiased;
        }
        .wrapper {
          width: 100%;
          background-color: #050d1a;
          padding: 20px 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #0a1628;
          border: 1px solid rgba(200, 169, 81, 0.2);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
        }
        .header {
          padding: 30px;
          background: linear-gradient(135deg, #0a1628 0%, #0f1f35 100%);
          text-align: center;
          border-bottom: 2px solid #c8a951;
        }
        .header h1 {
          color: #ffffff;
          margin: 10px 0 0 0;
          font-size: 22px;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .header p {
          color: #c8a951;
          margin: 5px 0 0 0;
          font-size: 11px;
          font-weight: bold;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        .content {
          padding: 30px;
          background-color: #0a1628;
          color: #cbd5e1;
        }
        .content p {
          font-size: 15px;
          line-height: 1.6;
          color: #cbd5e1;
          margin-top: 0;
          margin-bottom: 16px;
        }
        .highlight-box {
          background-color: rgba(200, 169, 81, 0.05);
          border-left: 4px solid #c8a951;
          border-radius: 4px;
          padding: 20px;
          margin: 20px 0;
        }
        .btn-container {
          text-align: center;
          margin: 30px 0;
        }
        .btn {
          display: inline-block;
          background-color: #c8a951;
          color: #050d1a !important;
          padding: 12px 28px;
          font-size: 14px;
          font-weight: 900;
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: 1px;
          border-radius: 8px;
          transition: background-color 0.2s;
        }
        .footer {
          padding: 20px 30px;
          background-color: #050d1a;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          text-align: center;
          color: #94a3b8;
          font-size: 11px;
        }
        .footer p {
          margin: 5px 0;
          line-height: 1.5;
        }
        .footer .motto {
          color: #c8a951;
          font-weight: bold;
          letter-spacing: 1px;
          margin-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <div style="font-size: 32px; line-height: 1;">🎖️</div>
            <h1>National Cadet Corps</h1>
            <p>Digital Training Portal</p>
          </div>
          <div class="content">
            ${bodyHtml}
            ${ctaText && ctaLink ? `
              <div class="btn-container">
                <a href="${ctaLink}" class="btn" target="_blank">${ctaText}</a>
              </div>
            ` : ''}
          </div>
          <div class="footer">
            <p>This is an automated notification from the official NCC Digital Training Portal.</p>
            <p>&copy; ${new Date().getFullYear()} NCC Digital Training. All Rights Reserved.</p>
            <p class="motto">UNITY AND DISCIPLINE • EKTA AUR ANUSHASAN</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Announcement Email Template
const buildAnnouncementEmail = (cadetName, wing, title, content, priority) => {
  const bodyHtml = `
    <p>Dear Cadet <strong>${cadetName || 'NCC Cadet'}</strong>,</p>
    <p>A new announcement has been published for your wing (<strong>${wing || 'Common'}</strong>):</p>
    
    <div class="highlight-box">
      <h3 style="margin-top: 0; color: #ffffff; font-size: 16px; text-transform: uppercase; font-weight: 800;">${title}</h3>
      <p style="white-space: pre-line; color: #cbd5e1; margin-bottom: 0; font-size: 14px;">${content}</p>
    </div>
    
    <p style="font-size: 13px;">
      Priority Level: 
      <span style="font-weight: bold; color: ${priority === 'high' ? '#ef4444' : '#3b82f6'}; text-transform: uppercase;">
        ${priority || 'normal'}
      </span>
    </p>
    <p>Log in to your cadet dashboard to view complete bulletin files and resources.</p>
  `;

  return buildBaseTemplate({
    title: `NCC Announcement: ${title}`,
    bodyHtml,
    ctaText: 'Open Dashboard',
    ctaLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard`
  });
};

// Cadet Enrollment Email
const buildCadetEnrollmentEmail = (cadetName, courseTitle) => {
  const bodyHtml = `
    <p>Dear Cadet <strong>${cadetName}</strong>,</p>
    <p>You have successfully enrolled in the training course: <strong>${courseTitle}</strong>.</p>
    
    <div class="highlight-box">
      <p style="margin: 0; font-weight: bold; color: #c8a951; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">Course Milestone</p>
      <p style="margin: 5px 0 0 0; color: #ffffff; font-size: 16px; font-weight: bold;">${courseTitle}</p>
      <p style="margin: 5px 0 0 0; color: #94a3b8; font-size: 13px;">Status: Active / Training In Progress</p>
    </div>
    
    <p>Log in to view chapter modules, access tri-services slideshow materials, and test your knowledge in mock examinations.</p>
  `;

  return buildBaseTemplate({
    title: `📚 Enrolled: ${courseTitle}`,
    bodyHtml,
    ctaText: 'Start Learning',
    ctaLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/courses`
  });
};

// Instructor Enrollment Update
const buildInstructorEnrollmentEmail = (instructorName, cadetName, cadetWing, courseTitle) => {
  const bodyHtml = `
    <p>Hello Instructor <strong>${instructorName}</strong>,</p>
    <p>A cadet has enrolled in a new training course under your command:</p>
    
    <div class="highlight-box">
      <table style="width: 100%; border-collapse: collapse; color: #cbd5e1; font-size: 14px;">
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);"><td style="padding: 8px 0; font-weight: bold; color: #c8a951;">Cadet Name:</td><td style="padding: 8px 0; text-align: right; color: #ffffff;">${cadetName}</td></tr>
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);"><td style="padding: 8px 0; font-weight: bold; color: #c8a951;">Cadet Wing:</td><td style="padding: 8px 0; text-align: right; color: #ffffff; text-transform: uppercase;">${cadetWing}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold; color: #c8a951;">Course Title:</td><td style="padding: 8px 0; text-align: right; color: #ffffff;">${courseTitle}</td></tr>
      </table>
    </div>
    
    <p>You can review their syllabus progress and overall performance metrics via the instructor dashboard console.</p>
  `;

  return buildBaseTemplate({
    title: `👤 Cadet Enrolled: ${cadetName}`,
    bodyHtml,
    ctaText: 'Review Cadets',
    ctaLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/instructor/cadets`
  });
};

// Security flag email (Instructor warning)
const buildInstructorSecurityAlertEmail = (instructorName, cadetName, examTitle, flagsCount, reason) => {
  const bodyHtml = `
    <p><strong>ATTENTION INSTRUCTOR ${instructorName.toUpperCase()}</strong>,</p>
    <p>A security anomaly was flagged during an online mock examination:</p>
    
    <div class="highlight-box" style="border-left-color: #ef4444; background-color: rgba(239, 68, 68, 0.05);">
      <h3 style="margin-top: 0; color: #ef4444; text-transform: uppercase; font-size: 14px;">⚠️ Security Violation Warning</h3>
      <table style="width: 100%; border-collapse: collapse; color: #cbd5e1; font-size: 13px; margin-top: 10px;">
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);"><td style="padding: 6px 0; font-weight: bold;">Cadet Name:</td><td style="padding: 6px 0; text-align: right; color: #ffffff;">${cadetName}</td></tr>
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);"><td style="padding: 6px 0; font-weight: bold;">Exam:</td><td style="padding: 6px 0; text-align: right; color: #ffffff;">${examTitle}</td></tr>
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);"><td style="padding: 6px 0; font-weight: bold;">Violations:</td><td style="padding: 6px 0; text-align: right; color: #ef4444; font-weight: bold;">${flagsCount} Flag(s)</td></tr>
        <tr><td style="padding: 6px 0; font-weight: bold;">Reason:</td><td style="padding: 6px 0; text-align: right; color: #ffffff;">${reason}</td></tr>
      </table>
    </div>
    
    <p>Per strict NCC training protocols, any browser tab switches, exit events, or camera obstructions are logged and flagged automatically. Please investigate if corrective action is required.</p>
  `;

  return buildBaseTemplate({
    title: `⚠️ SECURITY ALERT: ${cadetName}`,
    bodyHtml,
    ctaText: 'Examine Logs',
    ctaLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/instructor/analytics`
  });
};

// Security flag email (Cadet warning)
const buildCadetSecurityAlertEmail = (cadetName, examTitle, flagsCount) => {
  const bodyHtml = `
    <p>Cadet <strong>${cadetName}</strong>,</p>
    <p>This is an official warning that <strong>${flagsCount} security alert(s)</strong> were registered during your mock exam: <strong>${examTitle}</strong>.</p>
    
    <div class="highlight-box" style="border-left-color: #d97706; background-color: rgba(217, 119, 6, 0.05);">
      <h3 style="margin-top: 0; color: #d97706; text-transform: uppercase; font-size: 14px;">⚠️ Academic Integrity Notice</h3>
      <p style="margin: 5px 0 0 0; color: #cbd5e1; font-size: 13px;">
        Exiting full-screen mode, switching browser tabs, or navigating away during examinations is strictly monitored. Accumulated warnings may lead to automatic failure or suspension from taking further mock tests.
      </p>
    </div>
    
    <p>Please ensure you maintain active focus inside the browser window for all future examinations.</p>
  `;

  return buildBaseTemplate({
    title: `⚠️ Exam Security Alert: ${examTitle}`,
    bodyHtml,
    ctaText: 'View Performance',
    ctaLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/performance`
  });
};

// Cadet Exam Result Email
const buildCadetResultEmail = (cadetName, examTitle, score, passingPercent, passed) => {
  const bodyHtml = `
    <p>Dear Cadet <strong>${cadetName}</strong>,</p>
    <p>Your test attempt has been submitted. Here is your official mock exam result:</p>
    
    <div class="highlight-box" style="border-left-color: ${passed ? '#16a34a' : '#dc2626'}; background-color: ${passed ? 'rgba(22, 163, 74, 0.05)' : 'rgba(220, 38, 38, 0.05)'}">
      <h3 style="margin-top: 0; color: ${passed ? '#16a34a' : '#dc2626'}; text-transform: uppercase; font-size: 15px; font-weight: 800;">
        ${passed ? '🎖️ Exam Passed / Competent' : '❌ Exam Not Cleared'}
      </h3>
      <table style="width: 100%; border-collapse: collapse; color: #cbd5e1; font-size: 14px; margin-top: 10px;">
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);"><td style="padding: 6px 0; font-weight: bold;">Exam Title:</td><td style="padding: 6px 0; text-align: right; color: #ffffff;">${examTitle}</td></tr>
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);"><td style="padding: 6px 0; font-weight: bold;">Passing Grade:</td><td style="padding: 6px 0; text-align: right; color: #ffffff;">${passingPercent}%</td></tr>
        <tr><td style="padding: 6px 0; font-weight: bold;">Your Score:</td><td style="padding: 6px 0; text-align: right; color: ${passed ? '#16a34a' : '#dc2626'}; font-weight: 900; font-size: 16px;">${score}%</td></tr>
      </table>
    </div>
    
    <p>${passed ? 'Excellent work! Your certificate syllabus credit will be updated dynamically in your profile.' : 'Do not lose heart. Review the syllabus study guides and try practice test modules again.'}</p>
  `;

  return buildBaseTemplate({
    title: `🎖️ Exam Result: ${examTitle} (${score}%)`,
    bodyHtml,
    ctaText: 'Review Answers',
    ctaLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/performance`
  });
};

// Result Release (when instructor marks or releases pending results)
const buildResultReleaseEmail = (cadetName, examTitle, score) => {
  const bodyHtml = `
    <p>Dear Cadet <strong>${cadetName}</strong>,</p>
    <p>An instructor has verified and released the official grade for your mock exam: <strong>${examTitle}</strong>.</p>
    
    <div class="highlight-box">
      <p style="margin: 0; font-weight: bold; color: #c8a951; text-transform: uppercase; font-size: 11px; letter-spacing: 1px;">Released Grade</p>
      <p style="margin: 5px 0 0 0; color: #ffffff; font-size: 16px; font-weight: bold;">Score: ${score}%</p>
      <p style="margin: 2px 0 0 0; color: #94a3b8; font-size: 13px;">Subject: ${examTitle}</p>
    </div>
    
    <p>You can now check the detailed question-by-question answer review in your cadet performance tab.</p>
  `;

  return buildBaseTemplate({
    title: `🔓 Result Released: ${examTitle}`,
    bodyHtml,
    ctaText: 'View Answers',
    ctaLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/performance`
  });
};

// Password Reset Email
const buildPasswordResetEmail = (cadetName, resetLink) => {
  const bodyHtml = `
    <p>Hello <strong>${cadetName || 'NCC User'}</strong>,</p>
    <p>We received a request to reset the password for your NCC Digital Training Portal account.</p>
    
    <div class="highlight-box">
      <p style="margin: 0; color: #cbd5e1; font-size: 14px; line-height: 1.5;">
        If you requested this change, please click the button below to set a new password. This secure reset link is only active for <strong>60 minutes</strong>.
      </p>
    </div>
    
    <p style="font-size: 12px; color: #94a3b8; margin-top: 20px;">
      If you did not initiate this request, you can safely ignore this email. Your current password remains secure.
    </p>
  `;

  return buildBaseTemplate({
    title: '🔒 Reset Your Password',
    bodyHtml,
    ctaText: 'Reset Password',
    ctaLink: resetLink
  });
};

module.exports = {
  buildAnnouncementEmail,
  buildCadetEnrollmentEmail,
  buildInstructorEnrollmentEmail,
  buildInstructorSecurityAlertEmail,
  buildCadetSecurityAlertEmail,
  buildCadetResultEmail,
  buildResultReleaseEmail,
  buildPasswordResetEmail
};
