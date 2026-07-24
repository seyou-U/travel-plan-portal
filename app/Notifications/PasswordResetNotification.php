<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * パスワード再設定リンクをメールで通知する。
 */
class PasswordResetNotification extends Notification
{
    /**
     * @param  string  $token  パスワード再設定トークン
     */
    public function __construct(private readonly string $token) {}

    /**
     * 通知で使用するチャンネルを返す。
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * パスワード再設定メールを生成する。
     */
    public function toMail(object $notifiable): MailMessage
    {
        $query = http_build_query([
            'token' => $this->token,
            'email' => $notifiable->getEmailForPasswordReset(),
        ]);
        $resetUrl = rtrim((string) config('app.frontend_url'), '/')."/reset-password?{$query}";

        return (new MailMessage)
            ->subject('パスワード再設定のご案内')
            ->view([
                'html' => 'emails.password-reset',
                'text' => 'emails.password-reset-text',
            ], [
                'name' => $notifiable->name,
                'resetUrl' => $resetUrl,
            ]);
    }
}
