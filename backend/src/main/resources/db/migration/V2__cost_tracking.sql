ALTER TABLE products ADD COLUMN cost_price DECIMAL(12, 2);
ALTER TABLE order_items ADD COLUMN cost_at_purchase DECIMAL(12, 2);

CREATE TABLE stock_purchases (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    cost_per_unit DECIMAL(12, 2) NOT NULL,
    total_cost DECIMAL(12, 2) NOT NULL,
    purchase_date TIMESTAMP NOT NULL,
    notes VARCHAR(1000),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stock_purchases_product ON stock_purchases(product_id);
CREATE INDEX idx_stock_purchases_date ON stock_purchases(purchase_date);
