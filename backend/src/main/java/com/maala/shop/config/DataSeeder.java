package com.maala.shop.config;

import com.maala.shop.entity.*;
import com.maala.shop.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Component
@Profile("dev")
@Order(1)
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final PaymentAccountRepository paymentAccountRepository;
    private final SiteSettingsRepository siteSettingsRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedAdmin();
        if (categoryRepository.count() == 0) {
            seedCategoriesAndProducts();
            seedPaymentAccounts();
            seedSiteSettings();
            log.info("Demo catalog seeded: {} products ready", productRepository.count());
        }
    }

    private void seedAdmin() {
        if (!userRepository.existsByRole(Role.ADMIN)) {
            userRepository.save(User.builder()
                    .name("Jiya")
                    .email("admin@shop.com")
                    .phone("923094094776")
                    .role(Role.ADMIN)
                    .passwordHash(passwordEncoder.encode("Admin@1234"))
                    .mustChangePassword(true)
                    .build());
            log.warn("Dev admin created: admin@shop.com — change password after first login");
            return;
        }
        userRepository.findAll().forEach(u -> {
            if (u.getRole() == Role.ADMIN && ("Admin".equals(u.getName()) || u.getName() == null || u.getName().isBlank())) {
                u.setName("Jiya");
                userRepository.save(u);
            }
        });
    }

    private void seedCategoriesAndProducts() {
        Category lawn = categoryRepository.save(Category.builder()
                .name("Lawn Suits")
                .imageUrl(CatalogImageConstants.CAT_LAWN)
                .build());
        Category kurta = categoryRepository.save(Category.builder()
                .name("Kurtas")
                .imageUrl(CatalogImageConstants.CAT_KURTA)
                .build());
        Category dupatta = categoryRepository.save(Category.builder()
                .name("Dupattas")
                .imageUrl(CatalogImageConstants.CAT_DUPATTA)
                .build());
        Category winter = categoryRepository.save(Category.builder()
                .name("Winter Collection")
                .imageUrl(CatalogImageConstants.CAT_WINTER)
                .build());

        saveProduct("Embroidered Lawn 3-Piece", "Premium lawn suit with delicate thread embroidery. Perfect for summer gatherings and daily wear.", lawn, "2800", "2499", CatalogImageConstants.LAWN_1, true, 12);
        saveProduct("Floral Printed Lawn Suit", "Vibrant floral print on soft cotton lawn. Includes shirt, trouser and dupatta.", lawn, "2200", "1999", CatalogImageConstants.LAWN_2, true, 15);
        saveProduct("Chikankari Lawn Suit", "Elegant chikankari work on pastel lawn. Lightweight and breathable.", lawn, "3200", null, CatalogImageConstants.LAWN_3, true, 8);
        saveProduct("Digital Print Lawn", "Trendy digital print in bold colors. Unstitched 3-piece set.", lawn, "1800", "1599", CatalogImageConstants.LAWN_4, false, 20);
        saveProduct("Organza Party Lawn", "Festive organza dupatta with embroidered lawn shirt. Ideal for Eid.", lawn, "4500", "3999", CatalogImageConstants.LAWN_5, true, 6);

        saveProduct("Classic Cotton Kurta", "Comfortable everyday cotton kurta. Pair with shalwar or trousers.", kurta, "1200", "999", CatalogImageConstants.KURTA_1, true, 18);
        saveProduct("Embroidered Kurta Set", "Festive kurta with matching shalwar. Machine embroidery on neckline.", kurta, "1800", null, CatalogImageConstants.KURTA_2, false, 10);
        saveProduct("Linen Kurta — Beige", "Premium linen fabric, perfect for summer. Relaxed fit.", kurta, "1500", "1299", CatalogImageConstants.KURTA_3, false, 14);
        saveProduct("Block Print Kurta", "Hand-block printed kurta in earthy tones. Unique artisan design.", kurta, "1600", null, CatalogImageConstants.KURTA_4, false, 9);

        saveProduct("Silk Chiffon Dupatta", "Luxurious silk chiffon with golden border. Adds elegance to any outfit.", dupatta, "850", "699", CatalogImageConstants.DUPATTA_1, true, 25);
        saveProduct("Organza Embroidered Dupatta", "Heavy organza with mirror work. Perfect for weddings.", dupatta, "1200", null, CatalogImageConstants.DUPATTA_2, false, 11);
        saveProduct("Cotton Net Dupatta", "Soft cotton net in pastel pink. Light and airy.", dupatta, "650", "549", CatalogImageConstants.DUPATTA_3, false, 16);
        saveProduct("Banarsi Silk Dupatta", "Traditional banarsi weave in rich maroon. Heirloom quality.", dupatta, "1800", "1599", CatalogImageConstants.DUPATTA_4, true, 7);

        saveProduct("Khaddar 3-Piece Suit", "Warm khaddar fabric for winter. Includes wool shawl dupatta.", winter, "3500", "3199", CatalogImageConstants.WINTER_1, true, 10);
        saveProduct("Velvet Shawl", "Premium velvet shawl in deep wine color. Soft and warm.", winter, "2800", null, CatalogImageConstants.WINTER_2, true, 8);
        saveProduct("Karandi Winter Suit", "Karandi weave suit with embroidered neckline. Cozy winter essential.", winter, "4200", "3899", CatalogImageConstants.WINTER_3, false, 5);
        saveProduct("Pashmina Style Shawl", "Soft pashmina-style shawl with tassels. Gift-worthy quality.", winter, "2200", "1999", CatalogImageConstants.WINTER_4, false, 12);

        saveProduct("Rose Pink Lawn 3-Piece", "Soft rose pink lawn 3-piece suit with printed dupatta. Premium quality from Maala Clothing.", lawn, "2400", "2199", CatalogImageConstants.LAWN_2, true, 10);
    }

    private void saveProduct(String name, String desc, Category cat, String price, String discount,
                             String image, boolean featured, int stock) {
        BigDecimal p = new BigDecimal(price);
        BigDecimal d = discount != null ? new BigDecimal(discount) : null;
        BigDecimal cost = p.multiply(new BigDecimal("0.55")).setScale(2, java.math.RoundingMode.HALF_UP);
        productRepository.save(Product.builder()
                .name(name)
                .description(desc)
                .price(p)
                .discountedPrice(d)
                .costPrice(cost)
                .stockQuantity(stock)
                .imageUrls(List.of(image))
                .category(cat)
                .sizes(Arrays.asList("S", "M", "L", "XL"))
                .colors(Arrays.asList("Pink", "Maroon", "Blue", "Green", "White"))
                .isActive(true)
                .isFeatured(featured)
                .build());
    }

    private void seedPaymentAccounts() {
        paymentAccountRepository.save(PaymentAccount.builder()
                .accountType("EasyPaisa")
                .accountTitle("Maala Clothing")
                .accountNumber("03094094776")
                .isActive(true)
                .displayOrder(0)
                .build());
        paymentAccountRepository.save(PaymentAccount.builder()
                .accountType("JazzCash")
                .accountTitle("Maala Clothing")
                .accountNumber("03094094776")
                .isActive(true)
                .displayOrder(1)
                .build());
    }

    private void seedSiteSettings() {
        siteSettingsRepository.save(SiteSettings.builder()
                .shopName("Maala Clothing")
                .shopTagline("Elegant Asian fashion from Mian Channu — delivered across Pakistan")
                .shopLogoUrl("/logo.svg")
                .whatsappNumber("923094094776")
                .deliveryCharges(new BigDecimal("250"))
                .freeDeliveryThreshold(new BigDecimal("999999999"))
                .announcementBanner("New lawn suits, kurtas and dupattas — Leopard Courier delivery across Pakistan")
                .contactEmail("contact@maalaclothing.com")
                .build());
    }
}
