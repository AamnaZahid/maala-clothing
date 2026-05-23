package com.maala.shop.config;

import com.maala.shop.entity.Category;
import com.maala.shop.entity.Product;
import com.maala.shop.entity.SiteSettings;
import com.maala.shop.repository.CategoryRepository;
import com.maala.shop.repository.ProductRepository;
import com.maala.shop.repository.SiteSettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * Refreshes demo catalog images to bundled /catalog photos on every dev startup.
 */
@Component
@Profile("dev")
@Order(2)
@RequiredArgsConstructor
@Slf4j
public class DevCatalogImageUpdater implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SiteSettingsRepository siteSettingsRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (productRepository.count() == 0) {
            return;
        }
        updateCategories();
        updateProducts();
        updateSiteSettings();
        log.info("Catalog images refreshed to bundled South Asian wear (/catalog/*.jpg)");
    }

    private void updateCategories() {
        for (Category cat : categoryRepository.findAll()) {
            switch (cat.getName()) {
                case "Lawn Suits" -> cat.setImageUrl(CatalogImageConstants.CAT_LAWN);
                case "Kurtas" -> cat.setImageUrl(CatalogImageConstants.CAT_KURTA);
                case "Dupattas" -> cat.setImageUrl(CatalogImageConstants.CAT_DUPATTA);
                case "Winter Collection" -> cat.setImageUrl(CatalogImageConstants.CAT_WINTER);
                default -> { }
            }
            categoryRepository.save(cat);
        }
    }

    private void updateProducts() {
        String[][] mapping = {
                {"Embroidered Lawn 3-Piece", CatalogImageConstants.LAWN_1},
                {"Floral Printed Lawn Suit", CatalogImageConstants.LAWN_2},
                {"Chikankari Lawn Suit", CatalogImageConstants.LAWN_3},
                {"Digital Print Lawn", CatalogImageConstants.LAWN_4},
                {"Organza Party Lawn", CatalogImageConstants.LAWN_5},
                {"Classic Cotton Kurta", CatalogImageConstants.KURTA_1},
                {"Embroidered Kurta Set", CatalogImageConstants.KURTA_2},
                {"Linen Kurta — Beige", CatalogImageConstants.KURTA_3},
                {"Block Print Kurta", CatalogImageConstants.KURTA_4},
                {"Silk Chiffon Dupatta", CatalogImageConstants.DUPATTA_1},
                {"Organza Embroidered Dupatta", CatalogImageConstants.DUPATTA_2},
                {"Cotton Net Dupatta", CatalogImageConstants.DUPATTA_3},
                {"Banarsi Silk Dupatta", CatalogImageConstants.DUPATTA_4},
                {"Khaddar 3-Piece Suit", CatalogImageConstants.WINTER_1},
                {"Velvet Shawl", CatalogImageConstants.WINTER_2},
                {"Karandi Winter Suit", CatalogImageConstants.WINTER_3},
                {"Pashmina Style Shawl", CatalogImageConstants.WINTER_4},
                {"Rose Pink Lawn 3-Piece", CatalogImageConstants.LAWN_2},
                {"گلابی", CatalogImageConstants.LAWN_2},
        };

        for (Product product : productRepository.findAll()) {
            String img = resolveImage(product.getName(), mapping);
            if (img == null) {
                img = CatalogImageConstants.LAWN_1;
            }
            if (product.getName() != null && product.getName().contains("گلابی")) {
                product.setName("Rose Pink Lawn 3-Piece");
                product.setDescription("Soft rose pink lawn 3-piece suit with printed dupatta. Premium stitching from Maala Clothing.");
                img = CatalogImageConstants.LAWN_2;
            }
            product.setImageUrls(List.of(img));
            if (product.getCostPrice() == null && product.getPrice() != null) {
                product.setCostPrice(product.getPrice()
                        .multiply(new BigDecimal("0.55"))
                        .setScale(2, java.math.RoundingMode.HALF_UP));
            }
            productRepository.save(product);
        }
    }

    private String resolveImage(String name, String[][] mapping) {
        if (name == null) return null;
        for (String[] row : mapping) {
            if (name.equals(row[0]) || name.contains(row[0])) {
                return row[1];
            }
        }
        return null;
    }

    private void updateSiteSettings() {
        siteSettingsRepository.findAll().forEach(settings -> {
            settings.setFreeDeliveryThreshold(new BigDecimal("999999999"));
            settings.setDeliveryCharges(new BigDecimal("250"));
            settings.setAnnouncementBanner("New lawn suits, kurtas & dupattas — Leopard Courier delivery across Pakistan");
            siteSettingsRepository.save(settings);
        });
    }
}
