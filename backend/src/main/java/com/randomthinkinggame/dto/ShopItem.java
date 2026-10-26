package com.randomthinkinggame.dto;

public class ShopItem {
    private String id;
    private String name;
    private String type; // THEME, AVATAR, POWERUP
    private long price;
    private String description;
    private String icon;
    private String previewColor;
    private boolean owned;

    public ShopItem() {
    }

    public ShopItem(String id, String name, String type, long price, String description, String icon, String previewColor, boolean owned) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.price = price;
        this.description = description;
        this.icon = icon;
        this.previewColor = previewColor;
        this.owned = owned;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public long getPrice() {
        return price;
    }

    public void setPrice(long price) {
        this.price = price;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getPreviewColor() {
        return previewColor;
    }

    public void setPreviewColor(String previewColor) {
        this.previewColor = previewColor;
    }

    public boolean isOwned() {
        return owned;
    }

    public void setOwned(boolean owned) {
        this.owned = owned;
    }
}
