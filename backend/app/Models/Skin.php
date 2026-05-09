<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Skin extends Model
{
    // Definició dels atributs que permeten l'assignació massiva
    protected $fillable = [
        'name',
        'image_url',
        'steam_price',
        'dmarket_price',
        'profit_margin',
        'volume',
        'last_updated'
    ];

    public function dmarketItems() {
        return $this->hasMany(DMarketItem::class);
    }

    /**
     * Relació: Una skin pot estar a l'inventari de molts usuaris.
     */
    public function userItems() 
    {
        return $this->hasMany(UserItem::class);
    }

    /**
     * Relació: Una skin té un historial format per molts registres de preus.
     */
    public function priceHistories() 
    {
        return $this->hasMany(PriceHistory::class);
    }
}