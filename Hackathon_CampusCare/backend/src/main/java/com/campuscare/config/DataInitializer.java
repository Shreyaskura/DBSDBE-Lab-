package com.campuscare.config;

import com.campuscare.entity.Category;
import com.campuscare.entity.Department;
import com.campuscare.entity.Role;
import com.campuscare.entity.User;
import com.campuscare.repository.CategoryRepository;
import com.campuscare.repository.DepartmentRepository;
import com.campuscare.repository.UserRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            UserRepository userRepository,
            DepartmentRepository departmentRepository,
            CategoryRepository categoryRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.categoryRepository = categoryRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        // Initialize Default Departments
        List<String> defaultDepts = List.of(
                "Office of Information Technology",
                "Physical Plant & Facilities",
                "Campus Residential Life",
                "Campus Security & Safety",
                "Sanitation & Environmental Services"
        );
        for (String deptName : defaultDepts) {
            if (!departmentRepository.existsByDepartmentName(deptName)) {
                departmentRepository.save(new Department(deptName, deptName + " operational service division"));
            }
        }

        // Initialize Default Categories
        List<String> defaultCats = List.of(
                "Electrical",
                "Plumbing",
                "Network & Wi-Fi",
                "Classroom Equipment",
                "Cleaning & Sanitation",
                "Infrastructure",
                "Transportation",
                "Other"
        );
        for (String catName : defaultCats) {
            if (!categoryRepository.existsByCategoryName(catName)) {
                categoryRepository.save(new Category(catName, catName + " service classification"));
            }
        }

        // Initialize or update Admin Account (admin@campuscare.edu / Admin@123)
        User admin = userRepository.findByEmail("admin@campuscare.edu").orElseGet(User::new);
        admin.setFullName("Campus Administrator");
        admin.setEmail("admin@campuscare.edu");
        admin.setPassword(passwordEncoder.encode("Admin@123"));
        admin.setRole(Role.ADMIN);
        admin.setDepartmentName("Campus Administration");
        userRepository.save(admin);

        // Initialize or update Staff Account (staff@campuscare.edu / Staff@123)
        User staff = userRepository.findByEmail("staff@campuscare.edu").orElseGet(User::new);
        staff.setFullName("Marcus Sterling");
        staff.setEmail("staff@campuscare.edu");
        staff.setPassword(passwordEncoder.encode("Staff@123"));
        staff.setRole(Role.STAFF);
        staff.setDepartmentName("Physical Plant & Facilities");
        userRepository.save(staff);
    }
}
