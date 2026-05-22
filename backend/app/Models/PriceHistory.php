<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PriceHistory extends Model
{
    use HasFactory;

    /**
     * Atributs permesos per a l'assignació massiva de dades.
     */
    protected $fillable = [
        'skin_id',
        'steam_price',
        'dmarket_price',
    ];

    /**
     * Relació inversa: Un registre d'historial pertany a una única skin del catàleg.
     */
    public function skin()
    {
        return $this->belongsTo(Skin::class);
    }
}