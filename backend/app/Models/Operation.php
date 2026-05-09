<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Operation extends Model
{
    use HasFactory;

    /**
     * Atributs permesos per a l'assignació massiva de dades.
     */
    protected $fillable = [
        'user_id', 
        'user_item_id', 
        'type', 
        'amount', 
        'profit', 
        'date'
    ];

    /**
     * Cast d'atributs especials per garantir tipus de dades correctes.
     */
    protected $casts = [
        'date' => 'datetime',
    ];

    /**
     * Relació amb l'usuari responsable de l'operació.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relació amb l'element del catàleg que ha estat intercanviat.
     */
    public function userItem()
    {
        return $this->belongsTo(UserItem::class);
    }
}
