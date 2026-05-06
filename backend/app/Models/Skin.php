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
        return $this->hasMany(MarketItem::class);
    }
}