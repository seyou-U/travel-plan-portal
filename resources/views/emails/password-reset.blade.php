<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>パスワード再設定のご案内</title>
</head>
<body style="margin: 0; background-color: #f1f5f9; color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
    <div style="padding: 32px 16px;">
        <div style="max-width: 560px; margin: 0 auto; overflow: hidden; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="padding: 28px 32px; background-color: #0f766e; color: #ffffff;">
                <h1 style="margin: 0; font-size: 22px;">Travel Plan Portal</h1>
            </div>
            <div style="padding: 32px;">
                <p style="margin: 0 0 20px; font-size: 16px;">{{ $name }} 様</p>
                <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.8;">
                    パスワード再設定のご依頼を受け付けました。
                </p>
                <p style="margin: 0 0 28px; font-size: 15px; line-height: 1.8;">
                    以下のボタンから新しいパスワードを設定してください。
                </p>
                <p style="margin: 0 0 28px; text-align: center;">
                    <a href="{{ $resetUrl }}" style="display: inline-block; padding: 13px 24px; border-radius: 8px; background-color: #0d9488; color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none;">
                        パスワードを再設定する
                    </a>
                </p>
                <p style="margin: 0 0 16px; color: #475569; font-size: 13px; line-height: 1.8;">
                    このリンクは60分間有効です。
                </p>
                <p style="margin: 0; color: #475569; font-size: 13px; line-height: 1.8;">
                    この操作に心当たりがない場合は、このメールを破棄してください。
                </p>
            </div>
            <div style="padding: 20px 32px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px;">
                Travel Plan Portal
            </div>
        </div>
    </div>
</body>
</html>
