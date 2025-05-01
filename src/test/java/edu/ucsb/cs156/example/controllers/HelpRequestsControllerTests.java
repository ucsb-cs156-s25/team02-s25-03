package edu.ucsb.cs156.example.controllers;

import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import edu.ucsb.cs156.example.ControllerTestCase;
import edu.ucsb.cs156.example.entities.UCSBDate;
import edu.ucsb.cs156.example.repositories.UCSBDateRepository;

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

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Autowired;
import edu.ucsb.cs156.example.controllers.HelpRequestController;
import edu.ucsb.cs156.example.entities.HelpRequest;
import edu.ucsb.cs156.example.repositories.HelpRequestRepository;



@WebMvcTest(controllers = HelpRequestController.class)
@Import(TestConfig.class)



public class HelpRequestsControllerTests extends ControllerTestCase{

        @MockBean
        HelpRequestRepository helpRequestRepository;

        @MockBean
        UserRepository userRepository;

        @Autowired
        ObjectMapper mapper;


        @Test
        public void logged_out_users_cannot_get_all() throws Exception {
                mockMvc.perform(get("/api/helprequests/all"))
                                .andExpect(status().is(403)); // logged out users can't get all
        }

        @WithMockUser(roles = { "USER" })
        @Test
        public void logged_in_users_can_get_all() throws Exception {
                mockMvc.perform(get("/api/helprequests/all"))
                                .andExpect(status().is(200)); // logged
        }

          @Test
        public void logged_out_users_cannot_post() throws Exception {
                mockMvc.perform(post("/api/helprequests/post"))
                                .andExpect(status().is(403));
        }

        @WithMockUser(roles = { "USER" })
        @Test
        public void logged_in_regular_users_cannot_post() throws Exception {
                mockMvc.perform(post("/api/helprequests/post"))
                                .andExpect(status().is(403)); // only admins can post
        }


        @WithMockUser(roles = { "USER" })
        @Test
        public void logged_in_user_can_get_all_helprequests() throws Exception {

                // arrange

                ZonedDateTime z1 = ZonedDateTime.parse("2022-01-03T00:00:00Z");


                HelpRequest helprequest1 = HelpRequest.builder()
                        .requesterEmail("cgaucho@ucsb.edu")
                        .teamId("s22-5pm-3")
                        .tableOrBreakoutRoom("7")
                        .requestTime(z1)
                        .explanation("Issue with dokku")
                        .solved(false)
                        .build();


                

                ArrayList<HelpRequest> expectedHelpRequests = new ArrayList<>();
                expectedHelpRequests.add(helprequest1);

                when(helpRequestRepository.findAll()).thenReturn(expectedHelpRequests);

                // act
                MvcResult response = mockMvc.perform(get("/api/helprequests/all"))
                                .andExpect(status().isOk()).andReturn();

                // assert

                verify(helpRequestRepository, times(1)).findAll();
                String expectedJson = mapper.writeValueAsString(expectedHelpRequests);
                String responseString = response.getResponse().getContentAsString();
                assertEquals(expectedJson, responseString);
        }


        @WithMockUser(roles = { "ADMIN", "USER" })
        @Test
        public void an_admin_user_can_post_a_new_helprequest() throws Exception {
                // arrange 

                ZonedDateTime z1 = ZonedDateTime.parse("2022-01-03T00:00:00Z");


                HelpRequest helprequest1 = HelpRequest.builder()
                        .requesterEmail("cgaucho@ucsb.edu")
                        .teamId("s22-5pm-3")
                        .tableOrBreakoutRoom("7")
                        .requestTime(z1)
                        .explanation("dokku-issue")
                        .solved(false)
                        .build();

                when(helpRequestRepository.save(eq(helprequest1))).thenReturn(helprequest1);

                // act
                MvcResult response = mockMvc.perform(
                                post("/api/helprequests/post?requesterEmail=cgaucho@ucsb.edu&teamId=s22-5pm-3&tableOrBreakoutRoom=7&requestTime=2022-01-03T00:00:00Z&explanation=dokku-issue&solved=false")
                                                .with(csrf()))
                                .andExpect(status().isOk()).andReturn();

                // assert
                verify(helpRequestRepository, times(1)).save(helprequest1);
                String expectedJson = mapper.writeValueAsString(helprequest1);
                String responseString = response.getResponse().getContentAsString();
                assertEquals(expectedJson, responseString);
        }

         @Test
        public void logged_out_users_cannot_get_by_id() throws Exception {
                mockMvc.perform(get("/api/helprequests?id=7"))
                                .andExpect(status().is(403)); // logged out users can't get by id
        }

         @WithMockUser(roles = { "USER" })
        @Test
        public void test_that_logged_in_user_can_get_by_id_when_the_id_does_not_exist() throws Exception {

                // arrange

                when(helpRequestRepository.findById(eq(7L))).thenReturn(Optional.empty());

                // act
                MvcResult response = mockMvc.perform(get("/api/helprequests?id=7"))
                                .andExpect(status().isNotFound()).andReturn();

                // assert

                verify(helpRequestRepository, times(1)).findById(eq(7L));
                Map<String, Object> json = responseToJson(response);
                assertEquals("EntityNotFoundException", json.get("type"));
                assertEquals("HelpRequest with id 7 not found", json.get("message"));
        }

        @WithMockUser(roles = { "USER" })
        @Test 
         public void test_that_logged_in_user_can_get_by_id_when_the_id_does_exist() throws Exception {

                ZonedDateTime z1 = ZonedDateTime.parse("2022-01-03T00:00:00Z");


                HelpRequest helprequest1 = HelpRequest.builder()
                        .requesterEmail("cgaucho@ucsb.edu")
                        .teamId("s22-5pm-3")
                        .tableOrBreakoutRoom("7")
                        .requestTime(z1)
                        .explanation("dokku-issue")
                        .solved(false)
                        .build();

                // arrange

                when(helpRequestRepository.findById(eq(7L))).thenReturn(Optional.of(helprequest1));

                // act
                MvcResult response = mockMvc.perform(get("/api/helprequests?id=7"))
                                .andExpect(status().isOk()).andReturn();

                // assert

                verify(helpRequestRepository, times(1)).findById(eq(7L));
                String expectedJson = mapper.writeValueAsString(helprequest1);
                String responseString = response.getResponse().getContentAsString();
                assertEquals(expectedJson, responseString);
                
        }


        @WithMockUser(roles = { "ADMIN", "USER" })
        @Test
        public void admin_can_edit_an_existing_helprequest() throws Exception {
                // arrange

                // LocalDateTime ldt1 = LocalDateTime.parse("2022-01-03T00:00:00");
                // LocalDateTime ldt2 = LocalDateTime.parse("2023-01-03T00:00:00");

                ZonedDateTime z1 = ZonedDateTime.parse("2022-01-03T00:00:00Z");

                ZonedDateTime z2 = ZonedDateTime.parse("2022-01-04T00:00:00Z");

                 HelpRequest helprequestOrig = HelpRequest.builder()
                        .requesterEmail("cgaucho@ucsb.edu")
                        .teamId("s22-5pm-3")
                        .tableOrBreakoutRoom("7")
                        .requestTime(z1)
                        .explanation("dokku-issue")
                        .solved(false)
                        .build();

                 HelpRequest helprequestEdit = HelpRequest.builder()
                        .requesterEmail("sburicha@ucsb.edu")
                        .teamId("s22-6pm-4")
                        .tableOrBreakoutRoom("5")
                        .requestTime(z2)
                        .explanation("jacoco-issue")
                        .solved(false)
                        .build();

                

                String requestBody = mapper.writeValueAsString(helprequestEdit);

                when(helpRequestRepository.findById(eq(67L))).thenReturn(Optional.of(helprequestOrig));

                // act
                MvcResult response = mockMvc.perform(
                                put("/api/helprequests?id=67")
                                                .contentType(MediaType.APPLICATION_JSON)
                                                .characterEncoding("utf-8")
                                                .content(requestBody)
                                                .with(csrf()))
                                .andExpect(status().isOk()).andReturn();

                // assert
                verify(helpRequestRepository, times(1)).findById(67L);
                verify(helpRequestRepository, times(1)).save(helprequestEdit); 
                String responseString = response.getResponse().getContentAsString();
                assertEquals(requestBody, responseString);
        }

        @WithMockUser(roles = { "ADMIN", "USER" })
        @Test
        public void admin_cannot_edit_helprequest_that_does_not_exist() throws Exception {
                // arrange

                ZonedDateTime z1 = ZonedDateTime.parse("2022-02-03T00:00:00Z");

                HelpRequest helprequestEdit = HelpRequest.builder()
                        .requesterEmail("cgauch@ucsb.edu")
                        .teamId("s22-7pm-3")
                        .tableOrBreakoutRoom("10")
                        .requestTime(z1)
                        .explanation("github-issue")
                        .solved(false)
                        .build();

                String requestBody = mapper.writeValueAsString(helprequestEdit);

                when(helpRequestRepository.findById(eq(67L))).thenReturn(Optional.empty());

                // act
                MvcResult response = mockMvc.perform(
                                put("/api/helprequests?id=67")
                                                .contentType(MediaType.APPLICATION_JSON)
                                                .characterEncoding("utf-8")
                                                .content(requestBody)
                                                .with(csrf()))
                                .andExpect(status().isNotFound()).andReturn();

                // assert
                verify(helpRequestRepository, times(1)).findById(67L);
                Map<String, Object> json = responseToJson(response);
                assertEquals("HelpRequest with id 67 not found", json.get("message"));

        }

        @WithMockUser(roles = { "ADMIN", "USER" })
        @Test
        public void admin_can_delete_a_helprequest() throws Exception {
                // arrange

                ZonedDateTime z1 = ZonedDateTime.parse("2023-06-03T00:00:00Z");

                HelpRequest helprequestEdit = HelpRequest.builder()
                        .requesterEmail("sgauch@ucsb.edu")
                        .teamId("s23-7pm-3")
                        .tableOrBreakoutRoom("1")
                        .requestTime(z1)
                        .explanation("github-issue")
                        .solved(false)
                        .build();
              

                when(helpRequestRepository.findById(eq(15L))).thenReturn(Optional.of(helprequestEdit));

                // act
                MvcResult response = mockMvc.perform(
                                delete("/api/helprequests?id=15")
                                                .with(csrf()))
                                .andExpect(status().isOk()).andReturn();

                // assert
                verify(helpRequestRepository, times(1)).findById(15L);
                verify(helpRequestRepository, times(1)).delete(eq(helprequestEdit));

                Map<String, Object> json = responseToJson(response);
                assertEquals("HelpRequest with id 15 deleted", json.get("message"));
        }


        @WithMockUser(roles = { "ADMIN", "USER" })
        @Test
        public void admin_tries_to_delete_non_existant_helprequest_and_gets_right_error_message()
                        throws Exception {
                // arrange

                when(helpRequestRepository.findById(eq(15L))).thenReturn(Optional.empty());

                // act
                MvcResult response = mockMvc.perform(
                                delete("/api/helprequests?id=15")
                                                .with(csrf()))
                                .andExpect(status().isNotFound()).andReturn();

                // assert
                verify(helpRequestRepository, times(1)).findById(15L);
                Map<String, Object> json = responseToJson(response);
                assertEquals("HelpRequest with id 15 not found", json.get("message"));
        }







}