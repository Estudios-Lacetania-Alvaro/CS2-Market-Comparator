<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserItem extends Model
{
    use HasFactory;

    /**
     * Atributs permesos per a l'assignació massiva de dades.
     */
    protected $fillable = [
        'user_id', 
        'skin_id', 
        'purchase_price', 
        'status'
    ];

    /**
     * Relació amb l'usuari propietari de l'ítem.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relació amb el catàleg de dades de la skin adquirida.
     */
    public function skin()
    {
        return $this->belongsTo(Skin::class);
    }

    /**
     * Registre històric d'operacions vinculades a aquest ítem específic.
     */
    public function operations()
    {
        return $this->hasMany(Operation::class);
    }
}
