<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DMarketItem extends Model
{
    // Es defineix el nom de la taula explícitament perquè no coincideix amb la convenció plural
    protected $table = 'dmarket_items';

    // Atributs que permeten l'assignació massiva
    protected $fillable = [
        'skin_id',
        'item_id',
        'price',
        'float_value',
        'inspect_link'
    ];

    /**
     * Definició de la relació inversa: un ítem de mercat pertany a una skin del catàleg.
     */
    public function skin(): BelongsTo
    {
        // Eloquent busca automàticament la columna 'skin_id' a la taula 'dmarket_items'
        return $this->belongsTo(Skin::class);
    }
}