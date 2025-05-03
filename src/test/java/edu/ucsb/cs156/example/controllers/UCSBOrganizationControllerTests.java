package edu.ucsb.cs156.example.controllers;

import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import edu.ucsb.cs156.example.ControllerTestCase;
import edu.ucsb.cs156.example.entities.UCSBDiningCommons;
import edu.ucsb.cs156.example.entities.UCSBOrganization;
import edu.ucsb.cs156.example.repositories.UCSBOrganizationRepository;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@WebMvcTest(controllers = UCSBOrganizationController.class)
@Import(TestConfig.class)

public class UCSBOrganizationControllerTests extends ControllerTestCase {
        @MockBean
        UCSBOrganizationRepository ucsbOrganizationRepository;

        @MockBean
        UserRepository userRepository;

        // Authorization tests for /api/ucsborganization/admin/all

        @Test
        public void logged_out_users_cannot_get_all() throws Exception {
                mockMvc.perform(get("/api/ucsborganization/all"))
                                .andExpect(status().is(403)); // logged out users can't get all
        }

        @WithMockUser(roles = { "USER" })
        @Test
        public void logged_in_users_can_get_all() throws Exception {
                mockMvc.perform(get("/api/ucsborganization/all"))
                                .andExpect(status().is(200)); // logged
        }

        @Test
        public void logged_out_users_cannot_get_by_id() throws Exception {
                mockMvc.perform(get("/api/ucsborganization?orgCode=IEEE"))
                                .andExpect(status().is(403)); // logged out users can't get by id
        }

        // Authorization tests for /api/ucsbdiningcommons/post
        // (Perhaps should also have these for put and delete)

        @Test
        public void logged_out_users_cannot_post() throws Exception {
                mockMvc.perform(post("/api/ucsborganization/post"))
                                .andExpect(status().is(403));
        }

        @WithMockUser(roles = { "USER" })
        @Test
        public void logged_in_regular_users_cannot_post() throws Exception {
                mockMvc.perform(post("/api/ucsborganization/post"))
                                .andExpect(status().is(403)); // only admins can post
        }

        // Tests with mocks for database actions

        @WithMockUser(roles = { "USER" })
        @Test
        public void test_that_logged_in_user_can_get_by_id_when_the_id_exists() throws Exception {

                // arrange

                UCSBOrganization ItripleE = UCSBOrganization.builder()
                                .orgCode("IEEE")
                                .orgTranslationShort("IEEE")
                                .orgTranslation("Institute of Electrical and Electronics Engineers")
                                .inactive(true)
                                .build();

                when(ucsbOrganizationRepository.findById(eq("IEEE"))).thenReturn(Optional.of(ItripleE));

                // act
                MvcResult response = mockMvc.perform(get("/api/ucsborganization?orgCode=IEEE"))
                                .andExpect(status().isOk()).andReturn();

                // assert

                verify(ucsbOrganizationRepository, times(1)).findById(eq("IEEE"));
                String expectedJson = mapper.writeValueAsString(ItripleE);
                String responseString = response.getResponse().getContentAsString();
                assertEquals(expectedJson, responseString);
        }

        @WithMockUser(roles = { "USER" })
        @Test
        public void test_that_logged_in_user_can_get_by_id_when_the_id_does_not_exist() throws Exception {

                // arrange

                when(ucsbOrganizationRepository.findById(eq("GAME"))).thenReturn(Optional.empty());

                // act
                MvcResult response = mockMvc.perform(get("/api/ucsborganization?orgCode=GAME"))
                                .andExpect(status().isNotFound()).andReturn();

                // assert

                verify(ucsbOrganizationRepository, times(1)).findById(eq("GAME"));
                Map<String, Object> json = responseToJson(response);
                assertEquals("EntityNotFoundException", json.get("type"));
                assertEquals("UCSBOrganization with id GAME not found", json.get("message"));
        }


        @WithMockUser(roles = { "USER" })
        @Test
        public void logged_in_user_can_get_all_ucsborganization() throws Exception {

                // arrange

                UCSBOrganization ItripleE = UCSBOrganization.builder()
                                .orgCode("IEEE")
                                .orgTranslationShort("IEEE")
                                .orgTranslation("Institute of Electrical and Electronics Engineers")
                                .inactive(true)
                                .build();

                UCSBOrganization DivingClub = UCSBOrganization.builder()
                                .orgCode("DIVE")
                                .orgTranslationShort("Diving Club")
                                .orgTranslation("UCSB Diving Club")
                                .inactive(false)
                                .build();

                ArrayList<UCSBOrganization> expectedOrgs = new ArrayList<>();
                expectedOrgs.addAll(Arrays.asList(ItripleE, DivingClub));

                when(ucsbOrganizationRepository.findAll()).thenReturn(expectedOrgs);

                // act
                MvcResult response = mockMvc.perform(get("/api/ucsborganization/all"))
                                .andExpect(status().isOk()).andReturn();

                // assert

                verify(ucsbOrganizationRepository, times(1)).findAll();
                String expectedJson = mapper.writeValueAsString(expectedOrgs);
                String responseString = response.getResponse().getContentAsString();
                assertEquals(expectedJson, responseString);
        }

        @WithMockUser(roles = { "ADMIN", "USER" })
        @Test
        public void an_admin_user_can_post_a_new_organization() throws Exception {
                // arrange

                UCSBOrganization ItripleE = UCSBOrganization.builder()
                                .orgCode("IEEE")
                                .orgTranslationShort("IEEE")
                                .orgTranslation("Institute of Electrical and Electronics Engineers")
                                .inactive(true)
                                .build();

                when(ucsbOrganizationRepository.save(eq(ItripleE))).thenReturn(ItripleE);

                // act
                MvcResult response = mockMvc.perform(
                                post("/api/ucsborganization/post?orgCode=IEEE&orgTranslationShort=IEEE&orgTranslation=Institute of Electrical and Electronics Engineers&inactive=true")
                                                .with(csrf()))
                                .andExpect(status().isOk()).andReturn();

                // assert
                verify(ucsbOrganizationRepository, times(1)).save(ItripleE);
                String expectedJson = mapper.writeValueAsString(ItripleE);
                String responseString = response.getResponse().getContentAsString();
                assertEquals(expectedJson, responseString);
        }

        @WithMockUser(roles = { "ADMIN", "USER" })
        @Test
        public void admin_can_delete_an_organization() throws Exception {
                // arrange

                UCSBOrganization ItripleE = UCSBOrganization.builder()
                                .orgCode("IEEE")
                                .orgTranslationShort("IEEE")
                                .orgTranslation("Institute of Electrical and Electronics Engineers")
                                .inactive(true)
                                .build();

                when(ucsbOrganizationRepository.findById(eq("IEEE"))).thenReturn(Optional.of(ItripleE));

                // act
                MvcResult response = mockMvc.perform(
                                delete("/api/ucsborganization?orgCode=IEEE")
                                                .with(csrf()))
                                .andExpect(status().isOk()).andReturn();

                // assert
                verify(ucsbOrganizationRepository, times(1)).findById("IEEE");
                verify(ucsbOrganizationRepository, times(1)).delete(any());

                Map<String, Object> json = responseToJson(response);
                assertEquals("UCSBOrganization with id IEEE deleted", json.get("message"));
        }

        @WithMockUser(roles = { "ADMIN", "USER" })
        @Test
        public void admin_tries_to_delete_non_existant_organization_and_gets_right_error_message()
                        throws Exception {
                // arrange

                when(ucsbOrganizationRepository.findById(eq("GAME"))).thenReturn(Optional.empty());

                // act
                MvcResult response = mockMvc.perform(
                                delete("/api/ucsborganization?orgCode=GAME")
                                                .with(csrf()))
                                .andExpect(status().isNotFound()).andReturn();

                // assert
                verify(ucsbOrganizationRepository, times(1)).findById("GAME");
                Map<String, Object> json = responseToJson(response);
                assertEquals("UCSBOrganization with id GAME not found", json.get("message"));
        }

        @WithMockUser(roles = { "ADMIN", "USER" })
        @Test
        public void admin_can_edit_an_existing_organization() throws Exception {
                // arrange

                UCSBOrganization ItripleE = UCSBOrganization.builder()
                                .orgCode("IEEE")
                                .orgTranslationShort("IEEE")
                                .orgTranslation("Institute of Electrical and Electronics Engineers")
                                .inactive(true)
                                .build();

                UCSBOrganization ItripleE_Edited = UCSBOrganization.builder()
                                .orgCode("IEEE")
                                .orgTranslationShort("IEEE-Engineering")
                                .orgTranslation("Institute of Electrical and Electronics Engineers - edited")
                                .inactive(false)
                                .build();

                String requestBody = mapper.writeValueAsString(ItripleE_Edited);

                when(ucsbOrganizationRepository.findById(eq("IEEE"))).thenReturn(Optional.of(ItripleE));

                // act
                MvcResult response = mockMvc.perform(
                                put("/api/ucsborganization?orgCode=IEEE")
                                                .contentType(MediaType.APPLICATION_JSON)
                                                .characterEncoding("utf-8")
                                                .content(requestBody)
                                                .with(csrf()))
                                .andExpect(status().isOk()).andReturn();

                // assert
                verify(ucsbOrganizationRepository, times(1)).findById("IEEE");
                verify(ucsbOrganizationRepository, times(1)).save(ItripleE_Edited); // should be saved with updated info
                String responseString = response.getResponse().getContentAsString();
                assertEquals(requestBody, responseString);
        }

        @WithMockUser(roles = { "ADMIN", "USER" })
        @Test
        public void admin_cannot_edit_organization_that_does_not_exist() throws Exception {
                // arrange

                UCSBOrganization ItripleE_Edited = UCSBOrganization.builder()
                                .orgCode("IEEE")
                                .orgTranslationShort("IEEE-Engineering")
                                .orgTranslation("Institute of Electrical and Electronics Engineers - edited")
                                .inactive(false)
                                .build();

                String requestBody = mapper.writeValueAsString(ItripleE_Edited);

                when(ucsbOrganizationRepository.findById(eq("IEEE"))).thenReturn(Optional.empty());

                // act
                MvcResult response = mockMvc.perform(
                                put("/api/ucsborganization?orgCode=IEEE")
                                                .contentType(MediaType.APPLICATION_JSON)
                                                .characterEncoding("utf-8")
                                                .content(requestBody)
                                                .with(csrf()))
                                .andExpect(status().isNotFound()).andReturn();

                // assert
                verify(ucsbOrganizationRepository, times(1)).findById("IEEE");
                Map<String, Object> json = responseToJson(response);
                assertEquals("UCSBOrganization with id IEEE not found", json.get("message"));

        }
        
}
